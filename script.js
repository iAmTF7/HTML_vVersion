document.addEventListener('DOMContentLoaded', () => {
    // ==========================================
    // 1. INSTANT SEARCH (TÌM KIẾM TỨC THÌ)
    // ==========================================
    const searchInputs = document.querySelectorAll('nav form input[type="text"]');
    
    // Giả lập dữ liệu tìm kiếm
    const searchDatabase = [
        { title: 'Liveshow "Sáng Tối" - Hà Anh Tuấn', url: 'event-details.html?id=1' },
        { title: 'Liveshow Mùa Hè 2026', url: 'event-details.html?id=1' },
        { title: 'Đêm nhạc Acoustic', url: 'event-details.html?id=2' },
        { title: 'Music Night 2026', url: 'event-details.html?id=3' }
    ];

    searchInputs.forEach(input => {
        // Tạo container bọc input để dropdown có thể định vị tuyệt đối theo nó
        const wrapper = document.createElement('div');
        wrapper.style.position = 'relative';
        wrapper.style.display = 'inline-block';
        wrapper.style.width = '100%';
        
        input.parentNode.insertBefore(wrapper, input);
        wrapper.appendChild(input);

        // Tạo ul dropdown
        const dropdown = document.createElement('ul');
        dropdown.className = 'search-dropdown';
        wrapper.appendChild(dropdown);

        input.addEventListener('input', (e) => {
            const val = e.target.value.toLowerCase().trim();
            if (val.length >= 2) {
                // Lọc kết quả
                const results = searchDatabase.filter(item => item.title.toLowerCase().includes(val));
                
                if (results.length > 0) {
                    dropdown.innerHTML = results.map(item => `<li><a href="${item.url}">${item.title}</a></li>`).join('');
                } else {
                    dropdown.innerHTML = `<li><a href="#" style="color:var(--text-muted)">Không tìm thấy kết quả</a></li>`;
                }
                dropdown.style.display = 'block';
            } else {
                dropdown.style.display = 'none';
            }
        });

        // Ẩn dropdown khi click ra ngoài
        document.addEventListener('click', (e) => {
            if (!wrapper.contains(e.target)) {
                dropdown.style.display = 'none';
            }
        });
    });

    // ==========================================
    // 2. HIỆU ỨNG SKELETON LOADING (TRANG CHỦ)
    // ==========================================
    const eventsSection = document.getElementById('events');
    if (eventsSection) {
        // Lấy tất cả article đang hiển thị
        const articles = Array.from(eventsSection.querySelectorAll('article'));
        const brs = Array.from(eventsSection.querySelectorAll('br'));
        
        if (articles.length > 0) {
            // Ẩn chúng đi tạm thời
            articles.forEach(a => a.style.display = 'none');
            brs.forEach(b => b.style.display = 'none');
            
            // Tạo spinner Loading
            const spinner = document.createElement('div');
            spinner.className = 'loading-spinner';
            spinner.textContent = 'Đang tải danh sách sự kiện...';
            eventsSection.appendChild(spinner);
            
            // Giả lập loading 1.5s
            setTimeout(() => {
                spinner.remove();
                articles.forEach(a => a.style.display = 'block');
                brs.forEach(b => b.style.display = 'block');
            }, 1500);
        }
    }
    
    // 3. XỬ LÝ SỰ KIỆN KHI DOM CỦA PAYMENT PAGE RENDER
    // ==========================================
    const paymentContainer = document.getElementById('payment-container');
    if (paymentContainer) {
        // Do inline script đã chạy trước đó và render innerHTML, 
        // ta gọi luôn hàm khởi tạo thay vì dùng MutationObserver
        initPaymentInteractions();
    }
});

function initPaymentInteractions() {
    // 1. Seat Selection (Chọn ghế)
    const seats = document.querySelectorAll('.seat');
    const quantityInput = document.querySelector('input[name="quantity"]');
    
    seats.forEach(seat => {
        seat.addEventListener('click', () => {
            // Cho phép chọn nhiều ghế, hoặc bỏ chọn
            seat.classList.toggle('selected');
            
            // Cập nhật số lượng vé bằng với số ghế đã chọn
            if (quantityInput) {
                const selectedCount = document.querySelectorAll('.seat.selected').length;
                quantityInput.value = selectedCount;
            }
        });
    });

    // 2. Countdown Timer (Đồng hồ đếm ngược 10 phút)
    let timeLeft = 600; // 10 phút = 600 giây
    const timerSpan = document.getElementById('countdown-time-text');
    
    if (timerSpan) {
        const timerInterval = setInterval(() => {
            timeLeft--;
            
            const minutes = Math.floor(timeLeft / 60);
            const seconds = timeLeft % 60;
            
            timerSpan.textContent = `${minutes < 10 ? '0'+minutes : minutes}:${seconds < 10 ? '0'+seconds : seconds}`;
            
            // Khi dưới 2 phút (120s), bắt đầu nhấp nháy đỏ
            if (timeLeft <= 120 && timeLeft > 0) {
                timerSpan.parentElement.classList.add('flashing-red');
            }
            
            if (timeLeft <= 0) {
                clearInterval(timerInterval);
                timerSpan.parentElement.classList.remove('flashing-red');
                timerSpan.parentElement.style.color = 'red';
                timerSpan.textContent = '00:00 (Hết thời gian!)';
                alert('Thời gian giữ vé đã hết. Vui lòng thử lại!');
                
                // Vô hiệu hóa nút thanh toán
                const btnThanhToan = document.querySelector('button[type="button"]');
                if (btnThanhToan) {
                    btnThanhToan.disabled = true;
                    btnThanhToan.style.opacity = '0.5';
                    btnThanhToan.style.cursor = 'not-allowed';
                }
            }
        }, 1000);
    }
}

// ==========================================
// 4. MOCK SOCIAL LOGIN
// ==========================================
function mockSocialLogin(provider) {
    alert(`Đang chuyển hướng sang trang đăng nhập bằng ${provider}...`);
    // Giả lập sau 1s đăng nhập thành công
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 1000);
}

// ==========================================
// 5. VALIDATION FORM (LOGIN, REGISTER, PAYMENT)
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    // Hàm hiển thị lỗi
    function showError(input, message) {
        input.classList.add('input-error');
        let errorSpan = input.nextElementSibling;
        if (!errorSpan || !errorSpan.classList.contains('error-message')) {
            errorSpan = document.createElement('span');
            errorSpan.className = 'error-message';
            input.parentNode.insertBefore(errorSpan, input.nextSibling);
        }
        errorSpan.textContent = message;
    }

    // Hàm xóa lỗi
    function clearError(input) {
        input.classList.remove('input-error');
        const errorSpan = input.nextElementSibling;
        if (errorSpan && errorSpan.classList.contains('error-message')) {
            errorSpan.remove();
        }
    }

    // Biểu thức chính quy (Regex)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^(0|\+84)[3|5|7|8|9][0-9]{8}$/;

    // 5.1 Validation Form Đăng Nhập
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            let isValid = true;
            const usernameInput = loginForm.querySelector('input[name="username"]');
            const passwordInput = loginForm.querySelector('input[name="password"]');

            clearError(usernameInput);
            clearError(passwordInput);

            if (!usernameInput.value.trim()) {
                showError(usernameInput, 'Vui lòng nhập Email hoặc tên đăng nhập.');
                isValid = false;
            } else if (usernameInput.value.includes('@') && !emailRegex.test(usernameInput.value)) {
                showError(usernameInput, 'Email không hợp lệ.');
                isValid = false;
            }

            if (!passwordInput.value.trim()) {
                showError(passwordInput, 'Vui lòng nhập mật khẩu.');
                isValid = false;
            }

            if (!isValid) e.preventDefault();
        });
    }

    // 5.2 Validation Form Đăng Ký
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', (e) => {
            let isValid = true;
            const inputs = ['fullname', 'email', 'phone', 'username', 'password', 'confirm_password'];
            const fields = {};
            
            inputs.forEach(name => {
                fields[name] = registerForm.querySelector(`input[name="${name}"]`);
                clearError(fields[name]);
            });

            if (!fields.fullname.value.trim()) { showError(fields.fullname, 'Vui lòng nhập họ và tên.'); isValid = false; }
            if (!emailRegex.test(fields.email.value)) { showError(fields.email, 'Email không hợp lệ.'); isValid = false; }
            if (!phoneRegex.test(fields.phone.value)) { showError(fields.phone, 'Số điện thoại không hợp lệ.'); isValid = false; }
            if (!fields.username.value.trim()) { showError(fields.username, 'Vui lòng nhập tên đăng nhập.'); isValid = false; }
            if (fields.password.value.length < 6) { showError(fields.password, 'Mật khẩu phải từ 6 ký tự.'); isValid = false; }
            if (fields.password.value !== fields.confirm_password.value) { showError(fields.confirm_password, 'Mật khẩu nhập lại không khớp.'); isValid = false; }

            if (!isValid) e.preventDefault();
        });
    }

    // 5.3 Validation & Mock Payment Flow (Payment Page)
    if (paymentContainer) {
        const btnThanhToan = document.querySelector('#payment-container button[type="button"]');
        if (btnThanhToan) {
            btnThanhToan.addEventListener('click', () => {
                let isValid = true;
                
                // 1. Kiểm tra ghế
                const selectedSeats = document.querySelectorAll('.seat.selected');
                if (selectedSeats.length === 0) {
                    alert('Bạn chưa chọn ghế nào trên sơ đồ!');
                    isValid = false;
                }

                // 2. Kiểm tra thông tin khách hàng
                const nameInput = document.querySelector('input[name="customer_name"]');
                const emailInput = document.querySelector('input[name="customer_email"]');
                const phoneInput = document.querySelector('input[name="customer_phone"]');

                [nameInput, emailInput, phoneInput].forEach(clearError);

                if (!nameInput.value.trim()) { showError(nameInput, 'Vui lòng nhập họ tên.'); isValid = false; }
                if (!emailRegex.test(emailInput.value)) { showError(emailInput, 'Email không hợp lệ.'); isValid = false; }
                if (!phoneRegex.test(phoneInput.value)) { showError(phoneInput, 'Số điện thoại không hợp lệ.'); isValid = false; }

                if (!isValid) return;

                // Nếu hợp lệ -> Gọi API Mock
                mockPaymentAPI(btnThanhToan, selectedSeats.length);
            });
        }
    }
});

// ==========================================
// 6. TƯƠNG TÁC API (MOCK) & XUẤT VÉ
// ==========================================
function mockPaymentAPI(button, ticketCount) {
    // Đổi trạng thái UI
    const originalText = button.textContent;
    button.textContent = 'Đang xử lý thanh toán...';
    button.disabled = true;
    button.style.backgroundColor = '#64748b'; // Màu xám

    // Giả lập gọi API (fetch)
    new Promise((resolve) => {
        setTimeout(() => {
            resolve({ status: 'Success', message: 'Thanh toán thành công' });
        }, 2000);
    }).then(response => {
        if (response.status === 'Success') {
            alert('Thanh toán thành công! Hệ thống đang xuất vé...');
            showTicketDownloadUI(ticketCount);
        }
    });
}

function showTicketDownloadUI(ticketCount) {
    const paymentContainer = document.getElementById('payment-container');
    const orderCode = 'ORD-' + Math.floor(Math.random() * 1000000);
    const qrCodeMock = 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=' + orderCode;

    paymentContainer.innerHTML = `
        <section style="text-align: center; padding: 40px 0;">
            <h2 style="color: #10b981;">🎉 Mua vé thành công!</h2>
            <p>Mã đơn hàng của bạn: <strong>${orderCode}</strong></p>
            <p>Số lượng vé: <strong>${ticketCount}</strong></p>
            
            <div style="margin: 30px 0;">
                <img src="${qrCodeMock}" alt="QR Code Vé" style="border: 5px solid white; border-radius: 8px;">
                <p style="margin-top: 10px; color: var(--text-muted);">Quét mã QR này tại cổng kiểm soát</p>
            </div>

            <div style="display: flex; gap: 15px; justify-content: center; margin-bottom: 30px;">
                <button type="button" onclick="downloadTicketImage()" style="background-color: var(--primary);">Tải ảnh vé về máy (.png)</button>
                <button type="button" onclick="sendTicketEmail()" style="background-color: transparent; border: 1px solid var(--primary); color: var(--primary) !important;">Gửi file PDF về Email</button>
            </div>
            
            <a href="my-tickets.html#ticket" style="display: block; margin-bottom: 10px;">Xem lại vé của tôi</a>
            <a href="index.html">Quay lại trang chủ</a>
        </section>
    `;
}

function downloadTicketImage() {
    alert('Đang tạo hình ảnh vé...');
    setTimeout(() => {
        alert('Tải thành công! (Mô phỏng: File ticket.png đã được lưu vào máy).');
    }, 1000);
}

function sendTicketEmail() {
    alert('Đang gửi vé điện tử (PDF) vào email của bạn...');
    setTimeout(() => {
        alert('Gửi Email thành công!');
    }, 1500);
}
