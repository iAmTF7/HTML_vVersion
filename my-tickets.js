// ==========================================
// LOGIC QUẢN LÝ VÉ, QUÉT VÉ CHECK-IN VÀ LỊCH SỬ DÀNH CHO TRANG MY-TICKETS.HTML
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
  // Lấy thông tin tài khoản đang đăng nhập từ LocalStorage
  const currentUser = JSON.parse(localStorage.getItem('currentUser'));
  
  // 1. KIỂM TRA TRẠNG THÁI ĐĂNG NHẬP
  // Nếu chưa đăng nhập, hiển thị thông báo và chặn truy cập thông tin
  if (!currentUser) {
    showLoggedOutState();
    return;
  }

  // Nếu đã đăng nhập, tiến hành chạy các tính năng:
  // - Render danh sách vé cá nhân
  // - Thiết lập máy quét QR giả lập cho Nhân viên soát vé
  // - Nạp danh sách lịch sử check-in vào bảng
  renderUserTickets();
  setupCheckinScanner();
  renderCheckinHistory();
});

// Hàm hiển thị giao diện khi người dùng chưa đăng nhập tài khoản
function showLoggedOutState() {
  const ticketRow = document.querySelector('#ticket .row.g-4');
  if (ticketRow) {
    ticketRow.innerHTML = `
      <div class="col-12 text-center py-5">
        <h3 class="text-warning mb-3">Vui lòng đăng nhập</h3>
        <p class="text-muted mb-4">Bạn cần đăng nhập để xem danh sách vé đã mua của mình.</p>
        <a href="login.html?redirect=my-tickets.html" class="btn btn-primary">Đăng nhập ngay</a>
      </div>
    `;
  }

  // Ẩn khu vực check-in và lịch sử soát vé
  const checkinSection = document.getElementById('checkin');
  const historySection = document.getElementById('checkin-history');
  if (checkinSection) {
    checkinSection.innerHTML = `
      <div class="container text-center py-4 border border-secondary rounded bg-dark bg-opacity-20">
        <p class="text-muted mb-0">🔒 Tính năng xác thực vé yêu cầu đăng nhập tài khoản nhân viên.</p>
      </div>
    `;
  }
  if (historySection) historySection.style.display = 'none';
}

// Hàm render danh sách vé thuộc sở hữu của người dùng hiện tại
function renderUserTickets() {
  const currentUser = JSON.parse(localStorage.getItem('currentUser'));
  const tickets = JSON.parse(localStorage.getItem('tickets')) || [];
  const ticketRow = document.querySelector('#ticket .row.g-4');
  if (!ticketRow) return;

  // Lọc lấy danh sách các vé do tài khoản hiện tại sở hữu
  const myTickets = tickets.filter(t => t.username === currentUser.username);

  // Nếu người dùng chưa mua vé nào, hiển thị thông báo mời mua vé
  if (myTickets.length === 0) {
    ticketRow.innerHTML = `
      <div class="col-12 text-center py-5">
        <p class="text-muted fs-4">Bạn chưa sở hữu vé nào của QRBOX</p>
        <p class="text-muted">Khám phá các Liveshow và đặt mua những tấm vé đầu tiên nhé!</p>
        <a href="index.html" class="btn btn-primary mt-2">Xem danh sách sự kiện</a>
      </div>
    `;
    return;
  }

  // Xóa nội dung tĩnh ban đầu và render các vé động từ LocalStorage
  ticketRow.innerHTML = '';
  myTickets.forEach(t => {
    const isUnused = t.status === 'unused';
    const statusText = isUnused ? 'Chưa sử dụng' : 'Đã sử dụng';
    const statusClass = isUnused ? 'status-unused' : 'status-used';
    
    // Gắn màu badge khác nhau dựa trên hạng vé
    let badgeClass = 'bg-primary';
    if (t.class.toLowerCase() === 'standard') badgeClass = 'bg-success';
    if (t.class.toLowerCase() === 'vvip') badgeClass = 'bg-warning text-dark';

    // Sinh ảnh QR code động chứa mã vé để nhân viên soát vé quét bằng API trực tuyến
    const qrData = encodeURIComponent(`TICKET_CODE:${t.code}|EVENT:${t.eventTitle}|OWNER:${t.owner}|CLASS:${t.class}|STATUS:${t.status}`);
    const qrImgSrc = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${qrData}`;

    const cardHtml = `
      <div class="col-12 col-md-6 col-lg-4">
        <article class="ticket-card" id="card-${t.code}">
          <div class="ticket-card-header">
            <span class="event-badge ${badgeClass}">${t.class.toUpperCase()}</span>
            <span class="ticket-status ${statusClass}">${statusText}</span>
          </div>

          <h2>${t.eventTitle}</h2>

          <ul class="ticket-info">
            <li><strong>Mã vé:</strong> <span>${t.code}</span></li>
            <li><strong>Mã sự kiện:</strong> <span>${t.eventCode}</span></li>
            <li><strong>Khách hàng:</strong> <span>${t.owner}</span></li>
            <li><strong>Thời gian:</strong> <span>${t.time}</span></li>
            <li><strong>Địa điểm:</strong> <span class="text-end" style="max-width: 150px;">${t.location.split(',')[0]}</span></li>
          </ul>

          <h3>QR Code vé</h3>

          <div class="ticket-qr">
            <div class="qr-canvas-container">
              <img src="${qrImgSrc}" alt="QR code cho ${t.code}" style="width: 140px; height: 140px;">
            </div>
          </div>

          <div class="ticket-actions">
            <!-- Nút tải vé offline dạng tệp .txt chứa thông tin chi tiết -->
            <button type="button" class="btn btn-primary" onclick="downloadTicket('${t.code}')">
              Tải vé
            </button>

            <!-- Nút in vé mở hộp thoại in của trình duyệt -->
            <button type="button" class="btn btn-outline-primary" onclick="printTicket('${t.code}')">
              In vé
            </button>
          </div>
        </article>
      </div>
    `;
    ticketRow.innerHTML += cardHtml;
  });
}

// 3. THIẾT LẬP BỘ ĐIỀU KHIỂN SOÁT VÉ GIẢ LẬP (Chỉ hiển thị cho vai trò staff hoặc admin)
function setupCheckinScanner() {
  const currentUser = JSON.parse(localStorage.getItem('currentUser'));
  const checkinSection = document.getElementById('checkin');
  const historySection = document.getElementById('checkin-history');
  
  if (!checkinSection) return;

  // Nếu người dùng đăng nhập chỉ là khách hàng thường, giới hạn và ẩn tính năng check-in
  if (currentUser.role === 'customer') {
    checkinSection.innerHTML = `
      <div class="container text-center py-4 border border-secondary rounded bg-dark bg-opacity-20">
        <h4 class="text-white mb-2">Quyền kiểm soát vé</h4>
        <p class="text-muted mb-0">Tài khoản của bạn là Khách hàng. Các chức năng Quét QR soát vé chỉ dành riêng cho Nhân viên (Staff) và Quản trị viên (Admin).</p>
      </div>
    `;
    if (historySection) historySection.style.display = 'none';
    return;
  }

  // Khởi tạo các nút điều khiển soát vé cho nhân viên
  const scannerBox = checkinSection.querySelector('.scanner-box');
  const btnStartScan = checkinSection.querySelector('.ticket-actions button:nth-child(1)');
  const btnStopScan = checkinSection.querySelector('.ticket-actions button:nth-child(2)');

  // Dọn dẹp nội dung mô phỏng tĩnh ban đầu trong scanner-box và nạp cấu trúc tương tác mới
  scannerBox.innerHTML = `
    <div class="scanner-laser"></div>
    <p class="scanner-placeholder-text">[ Nhấn Bắt đầu quét để khởi động camera mô phỏng ]</p>
    <select class="form-select scanner-sim-select" id="scannerSimSelect">
      <option value="">-- Chọn vé giả lập để quét --</option>
    </select>
    <button type="button" class="btn btn-sm btn-secondary mt-3 scanner-sim-select" id="btnSimScan">
      ⚡ Giả lập Quét vé này
    </button>
  `;

  const laser = scannerBox.querySelector('.scanner-laser');
  const placeholderText = scannerBox.querySelector('.scanner-placeholder-text');
  const simSelect = document.getElementById('scannerSimSelect');
  const btnSimScan = document.getElementById('btnSimScan');

  let isScanning = false;

  // Lắng nghe sự kiện Bắt đầu quét QR
  btnStartScan.addEventListener('click', () => {
    if (isScanning) return;
    isScanning = true;
    
    // Hiển thị thanh laser quét di chuyển lên xuống qua animation CSS
    laser.style.display = 'block';
    placeholderText.style.display = 'none';
    
    // Hiển thị phần chọn vé giả lập quét
    simSelect.style.display = 'block';
    btnSimScan.style.display = 'block';
    
    // Cập nhật danh sách các vé chưa sử dụng trong hệ thống vào dropdown
    updateScannerSimOptions();

    if (typeof showToast === 'function') {
      showToast('Đã khởi động camera quét QR code giả lập.', 'info');
    }
  });

  // Lắng nghe sự kiện Dừng quét QR
  btnStopScan.addEventListener('click', () => {
    if (!isScanning) return;
    isScanning = false;

    laser.style.display = 'none';
    placeholderText.style.display = 'block';
    simSelect.style.display = 'none';
    btnSimScan.style.display = 'none';

    if (typeof showToast === 'function') {
      showToast('Đã tắt máy quét.', 'info');
    }
  });

  // Lắng nghe sự kiện click nút Giả lập quét vé
  btnSimScan.addEventListener('click', () => {
    const selectedCode = simSelect.value;
    if (!selectedCode) {
      if (typeof showToast === 'function') {
        showToast('Vui lòng chọn một mã vé để giả lập quét.', 'warning');
      }
      return;
    }

    // Tiến hành kiểm tra và soát vé được chọn
    processCheckin(selectedCode);
  });

  // Lắng nghe biểu mẫu nhập mã vé thủ công (đáp ứng khi nhân viên nhập bàn phím trực tiếp)
  const manualForm = checkinSection.querySelector('#checkin form');
  if (manualForm) {
    const manualBtn = manualForm.querySelector('button');
    const manualInput = manualForm.querySelector('input[name="ticket_code"]');

    manualBtn.addEventListener('click', () => {
      const enteredCode = manualInput.value.trim().toUpperCase();
      if (!enteredCode) {
        if (typeof showToast === 'function') {
          showToast('Vui lòng nhập mã vé cần kiểm tra.', 'warning');
        }
        return;
      }

      // Tiến hành check-in
      processCheckin(enteredCode);
      manualInput.value = ''; // Reset lại ô input sau khi bấm
    });
  }
}

// Cập nhật danh sách các vé chưa sử dụng vào dropdown chọn giả lập soát vé
function updateScannerSimOptions() {
  const simSelect = document.getElementById('scannerSimSelect');
  if (!simSelect) return;

  const tickets = JSON.parse(localStorage.getItem('tickets')) || [];
  
  // Chỉ lấy những vé có trạng thái Chưa sử dụng
  const unusedTickets = tickets.filter(t => t.status === 'unused');

  simSelect.innerHTML = '<option value="">-- Chọn vé giả lập để quét --</option>';
  unusedTickets.forEach(t => {
    simSelect.innerHTML += `<option value="${t.code}">${t.code} - Hạng: ${t.class} (${t.owner})</option>`;
  });
}

// 4. LOGIC XỬ LÝ CHECK-IN (SOÁT VÉ VÀO CỔNG)
function processCheckin(ticketCode) {
  const tickets = JSON.parse(localStorage.getItem('tickets')) || [];
  const ticketIndex = tickets.findIndex(t => t.code.toUpperCase() === ticketCode.toUpperCase());

  // TRƯỜNG HỢP 1: Vé không tồn tại trong hệ thống LocalStorage
  if (ticketIndex === -1) {
    if (typeof showToast === 'function') {
      showToast(`❌ Vé không hợp lệ! Mã vé "${ticketCode}" không tồn tại trong hệ thống.`, 'danger');
    }
    return;
  }

  const ticket = tickets[ticketIndex];

  // TRƯỜNG HỢP 2: Vé tồn tại nhưng đã quét soát vé trước đó rồi
  if (ticket.status === 'used') {
    if (typeof showToast === 'function') {
      showToast(`⚠️ Cảnh báo: Vé đã được sử dụng! Khách hàng: ${ticket.owner}. Đã check-in vào lúc: ${ticket.checkinTime}`, 'warning');
    }
    return;
  }

  // TRƯỜNG HỢP 3: Vé hợp lệ và chưa sử dụng -> Thực hiện check-in thành công
  const now = new Date();
  const formatTime = now.toLocaleString('vi-VN');
  
  ticket.status = 'used'; // Cập nhật trạng thái thành Đã sử dụng
  ticket.checkinTime = formatTime; // Lưu thời gian soát vé
  
  // Lưu lại danh sách vé cập nhật vào LocalStorage
  localStorage.setItem('tickets', JSON.stringify(tickets));

  if (typeof showToast === 'function') {
    showToast(`✅ Check-in THÀNH CÔNG! Vé hợp lệ.<br>Khách hàng: <strong>${ticket.owner}</strong><br>Sự kiện: ${ticket.eventTitle} (${ticket.class})`, 'success');
  }

  // Làm mới giao diện: danh sách vé cá nhân, danh sách quét giả lập, và bảng lịch sử check-in
  renderUserTickets();
  updateScannerSimOptions();
  renderCheckinHistory();
}

// 5. RENDER BẢNG LỊCH SỬ CHECK-IN (Dành cho nhân viên theo dõi)
function renderCheckinHistory() {
  const historyTableBody = document.querySelector('#checkin-history table tbody');
  if (!historyTableBody) return;

  const tickets = JSON.parse(localStorage.getItem('tickets')) || [];
  
  // Lọc ra các vé có trạng thái đã sử dụng (đã check-in)
  const usedTickets = tickets.filter(t => t.status === 'used');

  // Nếu chưa có lượt check-in nào
  if (usedTickets.length === 0) {
    historyTableBody.innerHTML = `
      <tr>
        <td colspan="7" class="text-center text-muted">Chưa có lượt check-in nào được ghi nhận.</td>
      </tr>
    `;
    return;
  }

  // Sắp xếp danh sách lịch sử theo thứ tự lượt check-in mới nhất hiển thị lên đầu
  usedTickets.sort((a, b) => {
    return b.checkinTime.localeCompare(a.checkinTime);
  });

  historyTableBody.innerHTML = '';
  usedTickets.forEach((t, idx) => {
    const rowHtml = `
      <tr>
        <td>${idx + 1}</td>
        <td><strong>${t.code}</strong></td>
        <td>${t.owner}</td>
        <td>${t.eventTitle}</td>
        <td><span class="badge bg-secondary">${t.class}</span></td>
        <td>${t.checkinTime}</td>
        <td>
          <span class="ticket-status status-used">Đã check-in</span>
        </td>
      </tr>
    `;
    historyTableBody.innerHTML += rowHtml;
  });
}

// 6. HÀM XỬ LÝ TẢI VÉ OFFLINE (Tạo file .txt giả lập PDF vé để người dùng lưu trữ)
function downloadTicket(code) {
  const tickets = JSON.parse(localStorage.getItem('tickets')) || [];
  const ticket = tickets.find(t => t.code === code);
  
  if (!ticket) return;

  if (typeof showToast === 'function') {
    showToast(`Đang tạo tệp tải xuống cho vé ${code}...`, 'info');
  }

  setTimeout(() => {
    const content = `
=============================================
             VÉ XEM CA NHẠC QRBOX             
=============================================
Mã vé: ${ticket.code}
Hạng vé: ${ticket.class.toUpperCase()}
Sự kiện: ${ticket.eventTitle}
Khách hàng: ${ticket.owner}
Thời gian: ${ticket.time}
Địa điểm: ${ticket.location}
Trạng thái: ${ticket.status === 'unused' ? 'CHƯA SỬ DỤNG' : 'ĐÃ SỬ DỤNG'}
---------------------------------------------
Vui lòng xuất trình mã QR đính kèm vé khi vào
cửa để nhân viên check-in.
Chúc quý khách có một đêm nhạc tuyệt vời!
=============================================
`;

    // Tạo file Text Blob từ chuỗi và tự động kích hoạt tải xuống trên trình duyệt
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `QRBOX-TICKET-${code}.txt`;
    link.click();
    URL.revokeObjectURL(link.href);
    
    if (typeof showToast === 'function') {
      showToast(`Đã tải xuống vé ${code} thành công!`, 'success');
    }
  }, 1000);
}

// 7. HÀM IN VÉ
function printTicket(code) {
  if (typeof showToast === 'function') {
    showToast(`Đang kết nối máy in để in vé ${code}...`, 'info');
  }
  
  // Trì hoãn nhẹ rồi kích hoạt hộp thoại in tiêu chuẩn của trình duyệt
  setTimeout(() => {
    window.print();
  }, 500);
}
