document.addEventListener('DOMContentLoaded', () => {
  // Lấy thông tin tài khoản đang đăng nhập từ LocalStorage
  const currentUser = JSON.parse(localStorage.getItem('currentUser'));
  if (!currentUser) {
    showLoggedOutState();
    return;
  }
  renderUserTickets();
});
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
function renderUserTickets() {
  const currentUser = JSON.parse(localStorage.getItem('currentUser'));
  const tickets = JSON.parse(localStorage.getItem('tickets')) || [];
  const ticketRow = document.querySelector('#ticket .row.g-4');
  if (!ticketRow) return;
  const myTickets = tickets.filter(t => t.username === currentUser.username);
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
  ticketRow.innerHTML = '';
  myTickets.forEach(t => {
    const isUnused = t.status === 'unused';
    const statusText = isUnused ? 'Chưa sử dụng' : 'Đã sử dụng';
    const statusClass = isUnused ? 'status-unused' : 'status-used';
    let badgeClass = 'bg-primary';
    if (t.class.toLowerCase() === 'standard') badgeClass = 'bg-success';
    if (t.class.toLowerCase() === 'vvip') badgeClass = 'bg-warning text-dark';
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
function printTicket(code) {
  if (typeof showToast === 'function') {
    showToast(`Đang kết nối máy in để in vé ${code}...`, 'info');
  }
  setTimeout(() => {
    window.print();
  }, 500);
}
