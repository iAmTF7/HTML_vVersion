// ==========================================
// LOGIC ĐIỀU KHIỂN TRANG ADMIN-CHECKIN.HTML
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
  // Lấy phiên đăng nhập hiện tại từ LocalStorage
  const currentUser = JSON.parse(localStorage.getItem('currentUser'));

  // 1. PHÂN QUYỀN TRUY CẬP TRANG ADMIN-CHECKIN
  const accessDeniedEl = document.getElementById('access-denied');
  const adminContentEl = document.getElementById('admin-checkin-content');

  // Điều kiện kiểm tra: Phải đăng nhập và có vai trò là 'staff' hoặc 'admin'
  if (!currentUser || (currentUser.role !== 'staff' && currentUser.role !== 'admin')) {
    // Không có quyền truy cập: Hiện thẻ Access Denied, ẩn nội dung
    if (accessDeniedEl) accessDeniedEl.classList.remove('d-none');
    if (adminContentEl) adminContentEl.classList.add('d-none');
    return;
  }

  // Hợp lệ: Hiện nội dung quản trị, ẩn thẻ báo lỗi
  if (accessDeniedEl) accessDeniedEl.classList.add('d-none');
  if (adminContentEl) adminContentEl.classList.remove('d-none');

  // 2. HIỂN THỊ THÔNG TIN TÀI KHOẢN TRÊN DASHBOARD
  const adminUsernameText = document.getElementById('adminUsernameText');
  const adminRoleText = document.getElementById('adminRoleText');
  
  if (adminUsernameText) adminUsernameText.textContent = currentUser.fullname;
  if (adminRoleText) {
    adminRoleText.textContent = translateRole(currentUser.role);
    // Thay đổi màu sắc của badge dựa theo vai trò tài khoản
    if (currentUser.role === 'admin') {
      adminRoleText.className = 'ticket-status status-used'; // Đỏ (gợi ý quyền Admin tối cao)
    } else {
      adminRoleText.className = 'ticket-status status-unused'; // Xanh lá
    }
  }

  // 3. KHỞI TẠO CÁC SỰ KIỆN TƯƠNG TÁC
  updateDashboardStats();
  renderAdminTicketsTable();
  setupScanSimulation();
  setupManualCheckin();
});

// Chuyển ngữ vai trò sang tiếng Việt hiển thị
function translateRole(role) {
  if (role === 'admin') return 'Quản trị viên (Admin)';
  if (role === 'staff') return 'Nhân viên soát vé (Staff)';
  return 'Khách hàng';
}

// 4. HÀM CẬP NHẬT THỐNG KÊ DASHBOARD (STATS COUNTER)
function updateDashboardStats() {
  const tickets = JSON.parse(localStorage.getItem('tickets')) || [];
  
  const total = tickets.length;
  const checkedIn = tickets.filter(t => t.status === 'used').length;
  const unused = tickets.filter(t => t.status === 'unused').length;

  const totalEl = document.getElementById('totalTicketsText');
  const checkedInEl = document.getElementById('checkedInTicketsText');
  const unusedEl = document.getElementById('unusedTicketsText');

  if (totalEl) totalEl.textContent = total;
  if (checkedInEl) checkedInEl.textContent = checkedIn;
  if (unusedEl) unusedEl.textContent = unused;
}

// 5. RENDERING DANH SÁCH TOÀN BỘ VÉ CHO ADMIN THEO DÕI
function renderAdminTicketsTable() {
  const tableBody = document.getElementById('adminTicketTableBody');
  if (!tableBody) return;

  const tickets = JSON.parse(localStorage.getItem('tickets')) || [];

  if (tickets.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="7" class="text-center text-muted">Chưa có vé nào được mua trên hệ thống.</td>
      </tr>
    `;
    return;
  }

  tableBody.innerHTML = '';
  tickets.forEach(t => {
    const isUnused = t.status === 'unused';
    const statusText = isUnused ? 'Chưa sử dụng' : 'Đã check-in';
    const statusClass = isUnused ? 'status-unused' : 'status-used';
    const checkinTimeText = t.checkinTime ? t.checkinTime : 'Chưa check-in';
    
    // Nút hành động tương ứng:
    // - Vé chưa check-in: Nút check-in trực tiếp
    // - Vé đã check-in: Nút hoàn tác (undo) check-in dành riêng cho quản trị viên
    const actionButton = isUnused 
      ? `<button type="button" class="btn btn-sm btn-primary" onclick="adminTriggerCheckin('${t.code}')">Check-in</button>`
      : `<button type="button" class="btn btn-sm btn-outline-danger" onclick="adminUndoCheckin('${t.code}')">Hoàn tác</button>`;

    const rowHtml = `
      <tr>
        <td><strong>${t.code}</strong></td>
        <td>${t.owner}</td>
        <td>${t.eventTitle}</td>
        <td><span class="badge bg-secondary">${t.class}</span></td>
        <td>${checkinTimeText}</td>
        <td>
          <span class="ticket-status ${statusClass}">${statusText}</span>
        </td>
        <td>${actionButton}</td>
      </tr>
    `;
    tableBody.innerHTML += rowHtml;
  });
}

let html5QrCode = null;

// 6. THIẾT LẬP KHỞI ĐỘNG VÀ QUÉT MÃ QR QUA CAMERA (REAL CAMERA QR SCANNER)
function setupScanSimulation() {
  const startScanBtn = document.getElementById('startScanBtn');
  const stopScanBtn = document.getElementById('stopScanBtn');
  const readerEl = document.getElementById('admin-reader');

  if (!startScanBtn || !stopScanBtn || !readerEl) return;

  // Lắng nghe sự kiện Bắt đầu quét QR qua camera thực
  startScanBtn.addEventListener('click', () => {
    // 1. Dọn dẹp dòng chữ placeholder ban đầu
    readerEl.innerHTML = '';

    // 2. Khởi tạo máy quét html5QrCode trên thẻ #admin-reader nếu chưa có
    if (!html5QrCode) {
      html5QrCode = new Html5Qrcode("admin-reader");
    }

    // Cấu hình quét: tốc độ 15 FPS, kích thước khung quét tự động co giãn theo khung nhìn
    const config = { 
      fps: 15, 
      qrbox: (width, height) => {
        const minSize = Math.min(width, height);
        const qrboxSize = Math.floor(minSize * 0.7);
        return { width: qrboxSize, height: qrboxSize };
      }
    };

    // 3. Khởi chạy camera (facingMode: "environment" ưu tiên camera sau)
    html5QrCode.start(
      { facingMode: "environment" }, 
      config,
      (decodedText, decodedResult) => {
        // Callback khi camera giải mã QR thành công
        console.log("Mã quét được:", decodedText);
        
        // Trích xuất mã vé từ nội dung quét được
        let ticketCode = decodedText;
        if (decodedText.includes('TICKET_CODE:')) {
          const parts = decodedText.split('|');
          const codePart = parts.find(p => p.startsWith('TICKET_CODE:'));
          if (codePart) {
            ticketCode = codePart.replace('TICKET_CODE:', '');
          }
        }

        // Tiến hành check-in vé
        verifyAndProcessCheckin(ticketCode);
        
        // Rung nhẹ máy để báo hiệu quét thành công
        if (navigator.vibrate) {
          navigator.vibrate(200);
        }
      },
      (errorMessage) => {
        // Bỏ qua lỗi quét liên tục để tránh đầy log
      }
    ).then(() => {
      if (typeof showToast === 'function') {
        showToast('Camera đã được khởi động. Hãy căn chỉnh QR Code vào giữa khung hình!', 'success');
      }
    }).catch((err) => {
      console.error("Lỗi camera:", err);
      readerEl.innerHTML = `<p class="text-danger p-4 text-center m-0">Không thể mở camera. Vui lòng cấp quyền máy ảnh và sử dụng kết nối bảo mật HTTPS hoặc Localhost.</p>`;
      if (typeof showToast === 'function') {
        showToast('Mở camera thất bại! Hãy cấp quyền truy cập camera.', 'danger');
      }
    });
  });

  // Lắng nghe sự kiện Dừng quét QR
  stopScanBtn.addEventListener('click', () => {
    if (html5QrCode && html5QrCode.isScanning) {
      html5QrCode.stop().then(() => {
        readerEl.innerHTML = `<p class="admin-scanner-placeholder m-0">[ Máy ảnh đã tắt - Bấm Bắt đầu quét để bật lại ]</p>`;
        if (typeof showToast === 'function') {
          showToast('Đã dừng camera quét QR.', 'info');
        }
      }).catch((err) => {
        console.error("Lỗi dừng camera:", err);
      });
    }
  });

  // Lắng nghe các nút Quét thử nhanh (Demo tickets)
  const demoButtons = document.querySelectorAll('.demo-ticket-btn');
  demoButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const code = btn.getAttribute('data-code');
      verifyAndProcessCheckin(code);
    });
  });
}

// 7. THIẾT LẬP NHẬP MÃ THỦ CÔNG
function setupManualCheckin() {
  const form = document.getElementById('manualCheckinForm');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const input = document.getElementById('manualTicketCode');
    const enteredCode = input.value.trim().toUpperCase();

    if (!enteredCode) {
      if (typeof showToast === 'function') {
        showToast('Vui lòng điền mã vé cần kiểm soát.', 'warning');
      }
      return;
    }

    // Tiến hành soát vé
    verifyAndProcessCheckin(enteredCode);
    input.value = ''; // Reset ô nhập
  });
}

// 8. HÀM KIỂM TRA VÀ XÁC THỰC VÉ VÀO CỔNG CHÍNH (VERIFY CHECK-IN)
function verifyAndProcessCheckin(ticketCode) {
  const resultBox = document.getElementById('checkinResultBox');
  if (!resultBox) return;

  const tickets = JSON.parse(localStorage.getItem('tickets')) || [];
  const ticketIndex = tickets.findIndex(t => t.code.toUpperCase() === ticketCode.toUpperCase());

  // TRƯỜNG HỢP 1: Mã vé không tồn tại trong hệ thống LocalStorage
  if (ticketIndex === -1) {
    resultBox.className = 'checkin-result-box danger';
    resultBox.innerHTML = `
      <p class="checkin-result-title">❌ VÉ KHÔNG HỢP LỆ</p>
      <p class="checkin-result-details">Mã vé <strong>"${ticketCode}"</strong> không tìm thấy trên hệ thống cơ sở dữ liệu. Vui lòng kiểm tra lại!</p>
    `;
    if (typeof showToast === 'function') {
      showToast(`Lỗi: Vé ${ticketCode} không tồn tại trên hệ thống!`, 'danger');
    }
    return;
  }

  const ticket = tickets[ticketIndex];

  // TRƯỜNG HỢP 2: Vé hợp lệ nhưng đã được check-in sử dụng từ trước
  if (ticket.status === 'used') {
    resultBox.className = 'checkin-result-box warning';
    resultBox.innerHTML = `
      <p class="checkin-result-title">⚠️ VÉ ĐÃ ĐƯỢC SỬ DỤNG</p>
      <p class="checkin-result-details">
        Mã vé: <strong>${ticket.code}</strong><br>
        Khách hàng: <strong>${ticket.owner}</strong><br>
        Sự kiện: <strong>${ticket.eventTitle}</strong> (${ticket.class})<br>
        Thời gian soát vé trước đó: <span class="text-danger font-weight-bold">${ticket.checkinTime}</span>
      </p>
    `;
    if (typeof showToast === 'function') {
      showToast(`Cảnh báo: Vé ${ticket.code} đã check-in trước đó!`, 'warning');
    }
    return;
  }

  // TRƯỜNG HỢP 3: Vé hợp lệ và chưa sử dụng -> Check-in thành công
  const now = new Date();
  const formatTime = now.toLocaleString('vi-VN');

  ticket.status = 'used';
  ticket.checkinTime = formatTime;

  // Lưu cập nhật trạng thái vé vào LocalStorage
  localStorage.setItem('tickets', JSON.stringify(tickets));

  // Hiển thị kết quả thành công rực rỡ màu xanh lá
  resultBox.className = 'checkin-result-box success';
  resultBox.innerHTML = `
    <p class="checkin-result-title">✅ XÁC THỰC THÀNH CÔNG</p>
    <p class="checkin-result-details">
      Mã vé: <strong>${ticket.code}</strong> (Hạng: <span class="text-info">${ticket.class}</span>)<br>
      Khách hàng: <strong>${ticket.owner}</strong><br>
      Sự kiện: <strong>${ticket.eventTitle}</strong><br>
      Thời gian check-in: <span class="text-warning">${formatTime}</span>
    </p>
  `;

  if (typeof showToast === 'function') {
    showToast(`Thành công: Đã check-in vé ${ticket.code}!`, 'success');
  }

  // Cập nhật lại số liệu thống kê Dashboard và bảng danh sách vé
  updateDashboardStats();
  renderAdminTicketsTable();
}

// 9. NÚT CHECK-IN TRỰC TIẾP TRÊN BẢNG HÀNH ĐỘNG CỦA ADMIN
window.adminTriggerCheckin = function(ticketCode) {
  verifyAndProcessCheckin(ticketCode);
};

// 10. NÚT HOÀN TÁC CHECK-IN DÀNH CHO ADMIN (UNDO CHECK-IN)
// Thiết lập trạng thái vé từ "Đã check-in" về "Chưa sử dụng" và xóa mốc thời gian soát vé
window.adminUndoCheckin = function(ticketCode) {
  const tickets = JSON.parse(localStorage.getItem('tickets')) || [];
  const ticketIndex = tickets.findIndex(t => t.code === ticketCode);

  if (ticketIndex === -1) return;

  const ticket = tickets[ticketIndex];
  
  ticket.status = 'unused';
  ticket.checkinTime = null;

  // Lưu lại LocalStorage
  localStorage.setItem('tickets', JSON.stringify(tickets));

  if (typeof showToast === 'function') {
    showToast(`Đã hoàn tác check-in cho vé ${ticketCode}`, 'success');
  }

  // Cập nhật lại giao diện và kết quả kiểm tra
  updateDashboardStats();
  renderAdminTicketsTable();

  const resultBox = document.getElementById('checkinResultBox');
  if (resultBox) {
    resultBox.className = 'checkin-result-box';
    resultBox.innerHTML = `<p>Đã hoàn tác soát vé ${ticketCode}. Sẵn sàng kiểm tra lượt mới.</p>`;
  }
};
