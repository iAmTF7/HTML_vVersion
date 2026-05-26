// ==========================================
// LOGIC THANH TOÁN VÀ ĐẶT VÉ SỰ KIỆN DÀNH CHO TRANG PAYMENT-PAGE.HTML
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('payment-container');
  if (!container) return;

  // Lấy thông tin tài khoản đang đăng nhập và danh sách sự kiện từ LocalStorage
  const currentUser = JSON.parse(localStorage.getItem('currentUser'));
  const events = JSON.parse(localStorage.getItem('events'));

  // 1. KIỂM TRA TRẠNG THÁI ĐĂNG NHẬP
  // Nếu chưa đăng nhập, bắt buộc người dùng chuyển hướng tới trang đăng nhập
  if (!currentUser) {
    showLoginRequired(container);
    return;
  }

  // 2. LẤY MÃ SỰ KIỆN VÀ HẠNG VÉ TỪ ĐƯỜNG DẪN URL
  // Ví dụ URL: payment-page.html?id=EVT001&class=VIP
  const params = new URLSearchParams(window.location.search);
  const eventCode = params.get('id');
  const preSelectedClass = params.get('class');

  // Nếu thiếu mã sự kiện trên đường dẫn URL, báo lỗi
  if (!eventCode) {
    showPaymentError(container, 'Không tìm thấy thông tin thanh toán sự kiện.');
    return;
  }

  // Khớp mã sự kiện trong danh sách
  const event = events.find(e => e.code === eventCode.toUpperCase());
  if (!event) {
    showPaymentError(container, 'Sự kiện thanh toán không tồn tại.');
    return;
  }

  // 3. TIẾN HÀNH RENDER GIAO DIỆN THANH TOÁN
  renderPaymentPage(container, event, currentUser, preSelectedClass);
});

// Hàm thông báo yêu cầu đăng nhập nếu người dùng chưa đăng nhập
function showLoginRequired(container) {
  const currentUrl = window.location.href;
  container.innerHTML = `
    <div class="text-center py-5">
      <h2 class="text-warning mb-3">Yêu cầu đăng nhập</h2>
      <p class="text-muted mb-4">Bạn cần đăng nhập tài khoản QRBOX để thực hiện mua vé và thanh toán.</p>
      <!-- Truyền thêm tham số redirect để sau khi đăng nhập xong sẽ quay lại đúng trang thanh toán này -->
      <a href="login.html?redirect=${encodeURIComponent(currentUrl)}" class="btn btn-primary px-4 py-2">
        Đăng nhập ngay
      </a>
      <a href="index.html" class="btn btn-outline-primary ms-2 px-4 py-2">Quay lại trang chủ</a>
    </div>
  `;
}

// Hàm thông báo khi xảy ra lỗi thanh toán
function showPaymentError(container, message) {
  container.innerHTML = `
    <div class="text-center py-5">
      <h2 class="text-danger mb-3">Lỗi thanh toán</h2>
      <p class="text-muted mb-4">${message}</p>
      <a href="index.html" class="btn btn-primary">Quay lại trang chủ</a>
    </div>
  `;
}

// Hàm render toàn bộ trang thanh toán
function renderPaymentPage(container, event, user, preSelectedClass) {
  // Thay đổi tiêu đề tab trình duyệt
  document.title = `Thanh toán: ${event.title} | QRBOX`;

  // Mặc định chọn hạng vé đầu tiên nếu không có hạng vé được truyền qua URL
  let selectedClassObj = event.ticketClasses[0];
  if (preSelectedClass) {
    const found = event.ticketClasses.find(t => t.name.toLowerCase() === preSelectedClass.toLowerCase());
    if (found) selectedClassObj = found;
  }

  // Tạo layout chia làm 2 cột:
  // - Cột trái (Col-lg-8): Form chọn hạng vé, thông tin cá nhân và phương thức thanh toán.
  // - Cột phải (Col-lg-4): Bảng tổng hợp chi phí (Order Summary) đính kèm cố định khi cuộn trang.
  container.innerHTML = `
    <div class="payment-grid">
      <!-- CỘT TRÁI: BIỂU MẪU ĐẶT VÉ -->
      <div>
        <form id="ticketPurchaseForm" novalidate>
          <div class="payment-form-card">
            
            <!-- BƯỚC 1: LỰA CHỌN VÉ -->
            <div class="form-section-title">
              <span>1</span> Chọn loại vé & số lượng
            </div>
            
            <div class="row g-3 mb-4">
              <!-- Hộp chọn hạng vé -->
              <div class="col-12 col-md-8">
                <label>
                  <span>Hạng vé:</span>
                  <select id="ticketClassSelect" name="ticket_class">
                    ${event.ticketClasses.map(t => `
                      <option value="${t.name}" ${t.name === selectedClassObj.name ? 'selected' : ''}>
                        ${t.name} - ${t.price.toLocaleString('vi-VN')} VNĐ (Còn ${t.available} vé)
                      </option>
                    `).join('')}
                  </select>
                </label>
              </div>
              <!-- Số lượng vé muốn đặt -->
              <div class="col-12 col-md-4">
                <label>
                  <span>Số lượng:</span>
                  <input type="number" id="ticketQuantity" name="quantity" value="1" min="1" max="10">
                </label>
              </div>
            </div>

            <!-- BƯỚC 2: THÔNG TIN KHÁCH HÀNG (Tự động điền theo tài khoản đăng nhập) -->
            <div class="form-section-title">
              <span>2</span> Thông tin khách hàng nhận vé
            </div>

            <div class="row g-3 mb-4">
              <div class="col-12">
                <label>
                  <span>Họ và tên người nhận:</span>
                  <input type="text" id="custFullname" name="fullname" value="${user.fullname}">
                </label>
              </div>
              
              <div class="col-12 col-md-6">
                <label>
                  <span>Email:</span>
                  <input type="email" id="custEmail" name="email" value="${user.email}">
                </label>
              </div>

              <div class="col-12 col-md-6">
                <label>
                  <span>Số điện thoại:</span>
                  <input type="tel" id="custPhone" name="phone" value="${user.phone}">
                </label>
              </div>
            </div>

            <!-- BƯỚC 3: PHƯƠNG THỨC THANH TOÁN -->
            <div class="form-section-title">
              <span>3</span> Phương thức thanh toán
            </div>

            <div class="payment-methods">
              <label class="method-label">
                <input type="radio" name="payment_method" value="qr" checked>
                <div>
                  <strong>Quét mã QR chuyển khoản nhanh (Khuyên dùng)</strong>
                  <div class="method-details">Thanh toán tức thời bằng mã VietQR, duyệt vé tự động trong 2 giây.</div>
                </div>
              </label>

              <label class="method-label">
                <input type="radio" name="payment_method" value="momo">
                <div>
                  <strong>Ví điện tử MoMo</strong>
                  <div class="method-details">Thanh toán qua cổng ví điện tử MoMo.</div>
                </div>
              </label>

              <label class="method-label">
                <input type="radio" name="payment_method" value="bank">
                <div>
                  <strong>Chuyển khoản ngân hàng truyền thống</strong>
                  <div class="method-details">Chuyển khoản thủ công qua Internet Banking, duyệt vé trong vòng 10 phút.</div>
                </div>
              </label>
            </div>

            <!-- KHU VỰC THÔNG TIN & MÃ QR CHUYỂN KHOẢN (Hiển thị mặc định cho QR/Chuyển khoản) -->
            <div id="paymentQRBox" class="text-center mb-4">
              <div class="border border-secondary p-3 rounded bg-dark bg-opacity-20 d-inline-block w-100">
                <h5 class="text-white mb-3">Mã QR Thanh Toán</h5>
                <div class="qr-payment-box">
                  <!-- Sử dụng API sinh mã QR tự động từ thông tin số tài khoản và số tiền -->
                  <img id="vietQRApiImg" src="" alt="Chuyển khoản QR">
                  <p id="vietQRText">Đang tải mã chuyển khoản...</p>
                </div>
                <div class="mt-3 text-start text-sm text-muted" style="max-width: 400px; margin: 0 auto; line-height: 1.6;">
                  <div>👉 <strong>Ngân hàng:</strong> Vietcombanl</div>
                  <div>👉 <strong>Chủ tài khoản:</strong> LE THAN TUAN TUYEN</div>
                  <div>👉 <strong>Số tài khoản:</strong> 1049190359</div>
                  <div>👉 <strong>Số tiền:</strong> <span class="text-warning font-weight-bold" id="bankTransferAmount">0 VNĐ</span></div>
                  <div>👉 <strong>Nội dung chuyển khoản:</strong> <span class="text-info font-weight-bold" id="bankTransferContent">PAY</span></div>
                </div>
              </div>
            </div>

            <div class="auth-actions">
              <button type="submit" id="btnSubmitPayment" class="btn btn-primary w-100 py-3">
                Xác nhận & Thanh toán
              </button>
            </div>

          </div>
        </form>
      </div>

      <!-- CỘT PHẢI: TÓM TẮT ĐƠN HÀNG (STICKY SUMMARY) -->
      <div>
        <div class="payment-summary-card">
          <h3>Tóm tắt đơn hàng</h3>
          
          <div class="summary-row">
            <strong>Sự kiện:</strong>
            <span class="text-white text-end font-weight-bold" style="max-width: 150px;">${event.title}</span>
          </div>

          <div class="summary-row">
            <strong>Thời gian:</strong>
            <span>${event.date} - ${event.time}</span>
          </div>

          <div class="summary-row">
            <strong>Địa điểm:</strong>
            <span class="text-end" style="max-width: 150px;">${event.location.split(',')[0]}</span>
          </div>

          <hr style="border-color: rgba(255, 255, 255, 0.1);">

          <div class="summary-row">
            <strong>Hạng vé:</strong>
            <span id="summaryClass" class="text-info font-weight-bold">${selectedClassObj.name}</span>
          </div>

          <div class="summary-row">
            <strong>Đơn giá:</strong>
            <span id="summaryUnitPrice">${selectedClassObj.price.toLocaleString('vi-VN')} VNĐ</span>
          </div>

          <div class="summary-row">
            <strong>Số lượng:</strong>
            <span id="summaryQty">1 vé</span>
          </div>

          <div class="summary-row total">
            <strong>Tổng thanh toán:</strong>
            <span id="summaryTotal">0 VNĐ</span>
          </div>
        </div>
      </div>
    </div>
  `;

  // Liên kết các phần tử DOM cần thao tác động
  const ticketClassSelect = document.getElementById('ticketClassSelect');
  const ticketQuantity = document.getElementById('ticketQuantity');
  const paymentMethods = document.getElementsByName('payment_method');
  const paymentQRBox = document.getElementById('paymentQRBox');
  const vietQRApiImg = document.getElementById('vietQRApiImg');
  const vietQRText = document.getElementById('vietQRText');
  const bankTransferAmount = document.getElementById('bankTransferAmount');
  const bankTransferContent = document.getElementById('bankTransferContent');
  
  const summaryClass = document.getElementById('summaryClass');
  const summaryUnitPrice = document.getElementById('summaryUnitPrice');
  const summaryQty = document.getElementById('summaryQty');
  const summaryTotal = document.getElementById('summaryTotal');

  // Hàm tính toán và cập nhật chi phí đơn hàng khi người dùng thay đổi Hạng vé hoặc Số lượng
  function updateOrderTotals() {
    const selectedClassName = ticketClassSelect.value;
    const qty = parseInt(ticketQuantity.value, 10) || 1;
    
    // Tìm cấu hình giá của hạng vé được chọn
    const classObj = event.ticketClasses.find(t => t.name === selectedClassName);
    if (!classObj) return;

    // Tính tổng tiền
    const subtotal = classObj.price * qty;
    const formattedTotal = subtotal.toLocaleString('vi-VN') + ' VNĐ';

    // Cập nhật lên cột Tóm tắt đơn hàng ở bên phải
    summaryClass.textContent = classObj.name;
    summaryUnitPrice.textContent = classObj.price.toLocaleString('vi-VN') + ' VNĐ';
    summaryQty.textContent = qty + ' vé';
    summaryTotal.textContent = formattedTotal;

    // Cập nhật thông tin chi tiết tài khoản ngân hàng chuyển tiền
    bankTransferAmount.textContent = formattedTotal;
    
    // Sinh nội dung chuyển khoản ngẫu nhiên nhưng dễ phân loại
    const randomSeed = Math.floor(1000 + Math.random() * 9000);
    const codePrefix = `PAY QRBOX ${event.code} ${classObj.name.toUpperCase()} ${randomSeed}`;
    bankTransferContent.textContent = codePrefix;

    // Tạo QR code chuyển khoản động mã hóa toàn bộ dữ liệu qua API qrserver
    const qrData = encodeURIComponent(`STK: 19036789012015 | Nganhang: Techcombank | SoTien: ${subtotal} | ND: ${codePrefix}`);
    vietQRApiImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${qrData}`;
    vietQRText.textContent = `Quét mã để chuyển khoản ${formattedTotal}`;
  }

  // Lắng nghe sự kiện thay đổi Hạng vé
  ticketClassSelect.addEventListener('change', updateOrderTotals);
  
  // Lắng nghe sự kiện chỉnh sửa số lượng vé
  ticketQuantity.addEventListener('input', () => {
    let val = parseInt(ticketQuantity.value, 10);
    if (isNaN(val) || val < 1) ticketQuantity.value = 1;
    if (val > 10) {
      ticketQuantity.value = 10;
      if (typeof showToast === 'function') {
        showToast('Số lượng vé đặt tối đa mỗi lần là 10 vé', 'warning');
      }
    }
    updateOrderTotals();
  });

  // Lắng nghe sự kiện thay đổi phương thức thanh toán để ẩn/hiện mã QR
  paymentMethods.forEach(radio => {
    radio.addEventListener('change', (e) => {
      const value = e.target.value;
      if (value === 'qr' || value === 'bank') {
        paymentQRBox.style.display = 'block';
      } else {
        paymentQRBox.style.display = 'none';
      }
    });
  });

  // Khởi chạy tính toán chi phí ban đầu khi vừa nạp trang
  updateOrderTotals();

  // Xử lý nộp form khi người dùng nhấn nút Xác nhận & Thanh toán
  const form = document.getElementById('ticketPurchaseForm');
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const fullnameInput = document.getElementById('custFullname');
    const emailInput = document.getElementById('custEmail');
    const phoneInput = document.getElementById('custPhone');

    // 1. Kiểm tra tính hợp lệ của dữ liệu đầu vào (Validation)
    let valid = true;
    if (typeof clearErrorStyles === 'function') {
      clearErrorStyles([fullnameInput, emailInput, phoneInput]);
    }

    if (!fullnameInput.value.trim()) {
      if (typeof showInputError === 'function') showInputError(fullnameInput, 'Họ tên không được để trống');
      valid = false;
    }
    if (!emailInput.value.trim() || !validateEmail(emailInput.value.trim())) {
      if (typeof showInputError === 'function') showInputError(emailInput, 'Email không hợp lệ');
      valid = false;
    }
    if (!phoneInput.value.trim()) {
      if (typeof showInputError === 'function') showInputError(phoneInput, 'Số điện thoại không được để trống');
      valid = false;
    }

    if (!valid) return;

    // 2. Kiểm tra số lượng vé còn lại trong kho xem có đủ để đáp ứng hay không
    const globalEvents = JSON.parse(localStorage.getItem('events'));
    const freshEventIndex = globalEvents.findIndex(e => e.code === event.code);
    const freshEvent = globalEvents[freshEventIndex];
    
    const selectedClassName = ticketClassSelect.value;
    const qty = parseInt(ticketQuantity.value, 10);

    const freshClassIndex = freshEvent.ticketClasses.findIndex(t => t.name === selectedClassName);
    const freshClass = freshEvent.ticketClasses[freshClassIndex];

    if (freshClass.available < qty) {
      if (typeof showToast === 'function') {
        showToast(`Rất tiếc! Chỉ còn lại ${freshClass.available} vé hạng ${freshClass.name}. Vui lòng giảm số lượng.`, 'danger');
      }
      return;
    }

    // Vô hiệu hóa nút bấm và hiển thị spinner để ngăn người dùng click liên tục
    const submitBtn = document.getElementById('btnSubmitPayment');
    submitBtn.disabled = true;
    submitBtn.innerHTML = `
      <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
      Đang xử lý giao dịch...
    `;

    // 3. Giả lập kết nối tới cổng thanh toán và xử lý đơn hàng (Độ trễ 1.5 giây)
    setTimeout(() => {
      // Giảm trừ số lượng vé khả dụng trong kho sự kiện
      freshClass.available -= qty;
      localStorage.setItem('events', JSON.stringify(globalEvents));

      // Đọc danh sách vé hiện có từ LocalStorage
      const globalTickets = JSON.parse(localStorage.getItem('tickets')) || [];
      const paymentMethodVal = Array.from(paymentMethods).find(r => r.checked).value;

      // Sinh mã vé và tạo đối tượng vé mới cho từng số lượng người dùng đã đặt mua
      for (let i = 0; i < qty; i++) {
        const ticketId = Math.floor(100000 + Math.random() * 900000);
        const ticketCode = `TICKET-${event.code}-${ticketId}`;
        
        const newTicket = {
          code: ticketCode,
          eventCode: event.code,
          eventTitle: event.title,
          owner: fullnameInput.value.trim(),
          time: `${event.date} - ${event.time}`,
          location: event.location,
          class: selectedClassName,
          status: 'unused', // Trạng thái mặc định: Chưa soát vé vào cổng
          checkinTime: null,
          username: user.username, // Gắn vé với tài khoản mua
          paymentMethod: paymentMethodVal,
          purchaseDate: new Date().toLocaleString('vi-VN')
        };
        globalTickets.unshift(newTicket); // Đưa vé mới mua lên hàng đầu danh sách
      }

      // Lưu lại danh sách vé mới vào LocalStorage
      localStorage.setItem('tickets', JSON.stringify(globalTickets));

      if (typeof showToast === 'function') {
        showToast('Đặt vé & Thanh toán thành công!', 'success');
      }

      // Chuyển hướng người dùng về trang Vé của tôi để xem vé mới mua
      setTimeout(() => {
        window.location.href = 'my-tickets.html';
      }, 1000);

    }, 1500);
  });
}

// Hàm hỗ trợ kiểm tra định dạng email
function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}
