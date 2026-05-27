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
  renderUserTickets();
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
            <li><strong>Ghế ngồi:</strong> <span class="text-warning font-weight-bold">${t.seat || 'Chưa chọn'}</span></li>
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
            <button type="button" class="btn btn-primary" onclick="downloadTicket('${t.code}')">
              Tải vé
            </button>

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
Ghế ngồi: ${ticket.seat || 'Không có'}
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
