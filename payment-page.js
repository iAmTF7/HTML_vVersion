document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('payment-container');
  if (!container) return;
  const currentUser = JSON.parse(localStorage.getItem('currentUser'));
  const events = JSON.parse(localStorage.getItem('events'));
  if (!currentUser) {
    showLoginRequired(container);
    return;
  }
  const params = new URLSearchParams(window.location.search);
  const eventCode = params.get('id');
  const preSelectedClass = params.get('class');
  if (!eventCode) {
    showPaymentError(container, 'Không tìm thấy thông tin thanh toán sự kiện.');
    return;
  }
  const event = events.find(e => e.code === eventCode.toUpperCase());
  if (!event) {
    showPaymentError(container, 'Sự kiện thanh toán không tồn tại.');
    return;
  }
  renderPaymentPage(container, event, currentUser, preSelectedClass);
});
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
function showPaymentError(container, message) {
  container.innerHTML = `
    <div class="text-center py-5">
      <h2 class="text-danger mb-3">Lỗi thanh toán</h2>
      <p class="text-muted mb-4">${message}</p>
      <a href="index.html" class="btn btn-primary">Quay lại trang chủ</a>
    </div>
  `;
}
function renderPaymentPage(container, event, user, preSelectedClass) {
  document.title = `Thanh toán: ${event.title} | QRBOX`;
  let selectedClassObj = event.ticketClasses[0];
  if (preSelectedClass) {
    const found = event.ticketClasses.find(t => t.name.toLowerCase() === preSelectedClass.toLowerCase());
    if (found) selectedClassObj = found;
  }
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

            <!-- SƠ ĐỒ CHỌN GHẾ NGỒI -->
            <div class="seat-selection-section mb-4">
              <div class="form-section-title" style="margin-top: 0;">
                <span>1.5</span> Chọn vị trí ghế ngồi
              </div>
              
              <div class="stage-container text-center mb-3">
                <div class="stage-arc">SÂN KHẤU / STAGE</div>
              </div>

              <div id="seatingGrid" class="seating-grid mb-3">
                <!-- Sẽ được vẽ động từ JavaScript -->
              </div>

              <div class="seating-legend d-flex justify-content-center gap-3 text-sm flex-wrap">
                <div class="legend-item"><span class="seat-sample available"></span> Ghế trống</div>
                <div class="legend-item"><span class="seat-sample selected"></span> Đang chọn</div>
                <div class="legend-item"><span class="seat-sample occupied"></span> Đã đặt</div>
              </div>
            </div>

            <!-- BƯỚC 2: THÔNG TIN KHÁCH HÀNG -->
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

            <!-- KHU VỰC THÔNG TIN & MÃ QR CHUYỂN KHOẢN -->
            <div id="paymentQRBox" class="text-center mb-4">
              <div class="border border-secondary p-3 rounded bg-dark bg-opacity-20 d-inline-block w-100">
                <h5 class="text-white mb-3">Mã QR Thanh Toán</h5>
                <div class="qr-payment-box">
                  <img id="vietQRApiImg" src="" alt="Chuyển khoản QR">
                  <p id="vietQRText">Đang tải mã chuyển khoản...</p>
                </div>
                <div class="mt-3 text-start text-sm" style="max-width: 400px; margin: 0 auto; line-height: 1.6; color: #e5e7eb !important;">
                  <div>👉 <strong>Ngân hàng:</strong> Techcombank</div>
                  <div>👉 <strong>Chủ tài khoản:</strong> CÔNG TY CỔ PHẦN VÉ SỰ KIỆN QRBOX</div>
                  <div>👉 <strong>Số tài khoản:</strong> 19036789012015</div>
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

      <!-- CỘT PHẢI: TÓM TẮT ĐƠN HÀNG -->
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

          <hr style="border-color: rgba(242, 236, 236, 0.66) ;">

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

          <div class="summary-row">
            <strong>Ghế đã chọn:</strong>
            <span id="summarySeats" class="text-warning font-weight-bold">Chưa chọn</span>
          </div>

          <div class="summary-row total">
            <strong>Tổng thanh toán:</strong>
            <span id="summaryTotal">0 VNĐ</span>
          </div>
        </div>
      </div>
    </div>
  `;
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
  const summarySeats = document.getElementById('summarySeats');
  const summaryTotal = document.getElementById('summaryTotal');
  const seatingGrid = document.getElementById('seatingGrid');

  let selectedSeats = [];
  function getRowsForClass(event, className) {
    const sortedClasses = [...event.ticketClasses].sort((a, b) => b.price - a.price);
    const classIndex = sortedClasses.findIndex(c => c.name === className);
    if (sortedClasses.length === 3) {
      if (classIndex === 0) return ['A', 'B'];
      if (classIndex === 1) return ['C', 'D']; 
      return ['E', 'F', 'G', 'H'];             
    } else if (sortedClasses.length === 2) {
      if (classIndex === 0) return ['A', 'B', 'C'];
      return ['D', 'E', 'F', 'G'];                  
    }
    return ['A', 'B', 'C', 'D'];
  }
  function renderSeatingGrid() {
    const selectedClassName = ticketClassSelect.value;
    const qty = parseInt(ticketQuantity.value, 10) || 1;
    if (selectedSeats.length > qty) {
      selectedSeats = selectedSeats.slice(0, qty);
    }
    const rows = getRowsForClass(event, selectedClassName);
    const globalTickets = JSON.parse(localStorage.getItem('tickets')) || [];
    const occupiedSeats = globalTickets
      .filter(t => t.eventCode === event.code)
      .map(t => t.seat)
      .filter(Boolean);

    seatingGrid.innerHTML = '';

    rows.forEach(rowLetter => {
      const rowDiv = document.createElement('div');
      rowDiv.className = 'seat-row';

      const labelStart = document.createElement('span');
      labelStart.className = 'row-label';
      labelStart.textContent = rowLetter;
      rowDiv.appendChild(labelStart);
      for (let i = 1; i <= 10; i++) {
        const seatId = `${rowLetter}${i}`;
        const seatBtn = document.createElement('button');
        seatBtn.type = 'button';
        seatBtn.className = 'seat';
        seatBtn.textContent = i;
        seatBtn.setAttribute('data-seat-id', seatId);

        if (occupiedSeats.includes(seatId)) {
          seatBtn.classList.add('occupied');
          seatBtn.title = `Ghế ${seatId} đã được mua`;
        } else {
          if (selectedSeats.includes(seatId)) {
            seatBtn.classList.add('selected');
          }

          seatBtn.addEventListener('click', () => {
            handleSeatClick(seatId, seatBtn);
          });
        }

        rowDiv.appendChild(seatBtn);
      }

      const labelEnd = document.createElement('span');
      labelEnd.className = 'row-label';
      labelEnd.textContent = rowLetter;
      rowDiv.appendChild(labelEnd);

      seatingGrid.appendChild(rowDiv);
    });

    updateSummarySeats();
  }

  function handleSeatClick(seatId, seatBtn) {
    const qty = parseInt(ticketQuantity.value, 10) || 1;

    if (selectedSeats.includes(seatId)) {
      selectedSeats = selectedSeats.filter(s => s !== seatId);
      seatBtn.classList.remove('selected');
    } else {

      if (selectedSeats.length >= qty) {
        const oldestSeatId = selectedSeats.shift();
        const oldestBtn = seatingGrid.querySelector(`[data-seat-id="${oldestSeatId}"]`);
        if (oldestBtn) oldestBtn.classList.remove('selected');
      }
      selectedSeats.push(seatId);
      seatBtn.classList.add('selected');
    }
    updateSummarySeats();
  }
  function updateSummarySeats() {
    const qty = parseInt(ticketQuantity.value, 10) || 1;
    if (selectedSeats.length === 0) {
      summarySeats.textContent = 'Chưa chọn';
      summarySeats.className = 'text-warning font-weight-bold';
    } else {
      summarySeats.textContent = selectedSeats.join(', ');
      if (selectedSeats.length === qty) {
        summarySeats.className = 'text-success font-weight-bold';
      } else {
        summarySeats.className = 'text-warning font-weight-bold';
      }
    }
  }
  function updateOrderTotals() {
    const selectedClassName = ticketClassSelect.value;
    const qty = parseInt(ticketQuantity.value, 10) || 1;

    const classObj = event.ticketClasses.find(t => t.name === selectedClassName);
    if (!classObj) return;

    const subtotal = classObj.price * qty;
    const formattedTotal = subtotal.toLocaleString('vi-VN') + ' VNĐ';

    summaryClass.textContent = classObj.name;
    summaryUnitPrice.textContent = classObj.price.toLocaleString('vi-VN') + ' VNĐ';
    summaryQty.textContent = qty + ' vé';
    summaryTotal.textContent = formattedTotal;

    bankTransferAmount.textContent = formattedTotal;

    const randomSeed = Math.floor(1000 + Math.random() * 9000);
    const codePrefix = `PAY QRBOX ${event.code} ${classObj.name.toUpperCase()} ${randomSeed}`;
    bankTransferContent.textContent = codePrefix;

    const qrData = encodeURIComponent(`STK: 19036789012015 | Nganhang: Techcombank | SoTien: ${subtotal} | ND: ${codePrefix}`);
    vietQRApiImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${qrData}`;
    vietQRText.textContent = `Quét mã để chuyển khoản ${formattedTotal}`;
    renderSeatingGrid();
  }

  ticketClassSelect.addEventListener('change', () => {
    selectedSeats = [];
    updateOrderTotals();
  });

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

  updateOrderTotals();

  const form = document.getElementById('ticketPurchaseForm');
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const fullnameInput = document.getElementById('custFullname');
    const emailInput = document.getElementById('custEmail');
    const phoneInput = document.getElementById('custPhone');

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
    const qty = parseInt(ticketQuantity.value, 10);
    if (selectedSeats.length !== qty) {
      if (typeof showToast === 'function') {
        showToast(`Vui lòng chọn đủ ${qty} ghế ngồi trên sơ đồ.`, 'warning');
      }
      return;
    }

    const globalEvents = JSON.parse(localStorage.getItem('events'));
    const freshEventIndex = globalEvents.findIndex(e => e.code === event.code);
    const freshEvent = globalEvents[freshEventIndex];

    const selectedClassName = ticketClassSelect.value;
    const freshClassIndex = freshEvent.ticketClasses.findIndex(t => t.name === selectedClassName);
    const freshClass = freshEvent.ticketClasses[freshClassIndex];

    if (freshClass.available < qty) {
      if (typeof showToast === 'function') {
        showToast(`Rất tiếc! Chỉ còn ${freshClass.available} vé hạng ${freshClass.name}. Vui lòng giảm số lượng.`, 'danger');
      }
      return;
    }

   
    const submitBtn = document.getElementById('btnSubmitPayment');
    submitBtn.disabled = true;
    submitBtn.innerHTML = `
      <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
      Đang xử lý giao dịch...
    `;

    setTimeout(() => {
      freshClass.available -= qty;
      localStorage.setItem('events', JSON.stringify(globalEvents));

      const globalTickets = JSON.parse(localStorage.getItem('tickets')) || [];
      const paymentMethodVal = Array.from(paymentMethods).find(r => r.checked).value;
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
          seat: selectedSeats[i],
          status: 'unused',
          checkinTime: null,
          username: user.username,
          paymentMethod: paymentMethodVal,
          purchaseDate: new Date().toLocaleString('vi-VN')
        };
        globalTickets.unshift(newTicket);
      }

      localStorage.setItem('tickets', JSON.stringify(globalTickets));

      if (typeof showToast === 'function') {
        showToast('Đặt vé & Thanh toán thành công!', 'success');
      }

      setTimeout(() => {
        window.location.href = 'my-tickets.html';
      }, 1000);

    }, 1500);
  });
}

function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}
