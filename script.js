document.addEventListener('DOMContentLoaded', () => {
    initInstantSearch();
    initHomeLoading();
    initPaymentInteractions();
    initFormValidation();
});

// ==========================================
// 1. INSTANT SEARCH
// ==========================================
function initInstantSearch() {
    const searchInputs = document.querySelectorAll(
        'nav form input[type="text"], nav form input[type="search"]'
    );

    const searchDatabase = [
        { title: 'Liveshow "Sáng Tối" - Hà Anh Tuấn', url: 'event-details.html?id=1' },
        { title: 'Liveshow Mùa Hè 2026', url: 'event-details.html?id=1' },
        { title: 'Đêm nhạc Acoustic', url: 'event-details.html?id=2' },
        { title: 'Music Night 2026', url: 'event-details.html?id=3' }
    ];

    searchInputs.forEach(input => {
        if (input.dataset.searchReady === 'true') return;

        input.dataset.searchReady = 'true';

        const form = input.closest('form');

        const wrapper = document.createElement('div');
        wrapper.className = 'search-wrapper';
        wrapper.style.position = 'relative';
        wrapper.style.width = '100%';

        input.parentNode.insertBefore(wrapper, input);
        wrapper.appendChild(input);

        const dropdown = document.createElement('ul');
        dropdown.className = 'search-dropdown';
        dropdown.style.display = 'none';
        wrapper.appendChild(dropdown);

        function renderResults(keyword) {
            const val = keyword.toLowerCase().trim();

            if (val.length < 2) {
                dropdown.style.display = 'none';
                dropdown.innerHTML = '';
                return;
            }

            const results = searchDatabase.filter(item =>
                item.title.toLowerCase().includes(val)
            );

            if (results.length > 0) {
                dropdown.innerHTML = results.map(item => `
                    <li>
                        <a href="${item.url}">${item.title}</a>
                    </li>
                `).join('');
            } else {
                dropdown.innerHTML = `
                    <li>
                        <a href="#" onclick="return false;">Không tìm thấy kết quả</a>
                    </li>
                `;
            }

            dropdown.style.display = 'block';
        }

        input.addEventListener('input', e => {
            renderResults(e.target.value);
        });

        if (form) {
            form.addEventListener('submit', e => {
                e.preventDefault();

                const keyword = input.value.toLowerCase().trim();

                if (!keyword) return;

                const found = searchDatabase.find(item =>
                    item.title.toLowerCase().includes(keyword)
                );

                if (found) {
                    window.location.href = found.url;
                } else {
                    renderResults(keyword);
                }
            });
        }

        document.addEventListener('click', e => {
            if (!wrapper.contains(e.target)) {
                dropdown.style.display = 'none';
            }
        });
    });
}

// ==========================================
// 2. LOADING TRANG CHỦ
// ==========================================
function initHomeLoading() {
    const eventsSection = document.getElementById('events');
    if (!eventsSection) return;

    const articles = Array.from(eventsSection.querySelectorAll('article'));

    if (articles.length === 0) return;

    articles.forEach(article => {
        article.style.opacity = '0';
        article.style.transform = 'translateY(15px)';
    });

    const spinner = document.createElement('div');
    spinner.className = 'loading-spinner';
    spinner.textContent = 'Đang tải danh sách sự kiện...';
    eventsSection.appendChild(spinner);

    setTimeout(() => {
        spinner.remove();

        articles.forEach((article, index) => {
            setTimeout(() => {
                article.style.transition = '0.35s ease';
                article.style.opacity = '1';
                article.style.transform = 'translateY(0)';
            }, index * 120);
        });
    }, 700);
}

// ==========================================
// 3. PAYMENT PAGE
// ==========================================
function initPaymentInteractions() {
    const paymentContainer = document.getElementById('payment-container');
    if (!paymentContainer) return;

    const seats = document.querySelectorAll('.seat');
    const quantityInput = document.querySelector('input[name="quantity"]');

    seats.forEach(seat => {
        seat.addEventListener('click', () => {
            seat.classList.toggle('selected');

            if (quantityInput) {
                const selectedCount = document.querySelectorAll('.seat.selected').length;
                quantityInput.value = selectedCount;
            }
        });
    });

    let timeLeft = 600;
    const timerSpan = document.getElementById('countdown-time-text');

    if (timerSpan) {
        const timerInterval = setInterval(() => {
            timeLeft--;

            const minutes = Math.floor(timeLeft / 60);
            const seconds = timeLeft % 60;

            timerSpan.textContent =
                `${minutes < 10 ? '0' + minutes : minutes}:${seconds < 10 ? '0' + seconds : seconds}`;

            if (timeLeft <= 120 && timeLeft > 0) {
                timerSpan.parentElement.classList.add('flashing-red');
            }

            if (timeLeft <= 0) {
                clearInterval(timerInterval);
                timerSpan.parentElement.classList.remove('flashing-red');
                timerSpan.parentElement.style.color = 'red';
                timerSpan.textContent = '00:00 (Hết thời gian!)';

                alert('Thời gian giữ vé đã hết. Vui lòng thử lại!');

                const btnThanhToan = paymentContainer.querySelector('button[type="button"]');

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
// 4. VALIDATION FORM
// ==========================================
function initFormValidation() {
    const paymentContainer = document.getElementById('payment-container');

    function showError(input, message) {
        if (!input) return;

        input.classList.add('input-error');

        let errorSpan = input.nextElementSibling;

        if (!errorSpan || !errorSpan.classList.contains('error-message')) {
            errorSpan = document.createElement('span');
            errorSpan.className = 'error-message';
            input.parentNode.insertBefore(errorSpan, input.nextSibling);
        }

        errorSpan.textContent = message;
    }

    function clearError(input) {
        if (!input) return;

        input.classList.remove('input-error');

        const errorSpan = input.nextElementSibling;

        if (errorSpan && errorSpan.classList.contains('error-message')) {
            errorSpan.remove();
        }
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^(0|\+84)[35789][0-9]{8}$/;

    const loginForm = document.getElementById('loginForm');

    if (loginForm) {
        loginForm.addEventListener('submit', e => {
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

    const registerForm = document.getElementById('registerForm');

    if (registerForm) {
        registerForm.addEventListener('submit', e => {
            let isValid = true;

            const fields = {
                fullname: registerForm.querySelector('input[name="fullname"]'),
                email: registerForm.querySelector('input[name="email"]'),
                phone: registerForm.querySelector('input[name="phone"]'),
                username: registerForm.querySelector('input[name="username"]'),
                password: registerForm.querySelector('input[name="password"]'),
                confirm_password: registerForm.querySelector('input[name="confirm_password"]')
            };

            Object.values(fields).forEach(clearError);

            if (!fields.fullname.value.trim()) {
                showError(fields.fullname, 'Vui lòng nhập họ và tên.');
                isValid = false;
            }

            if (!emailRegex.test(fields.email.value)) {
                showError(fields.email, 'Email không hợp lệ.');
                isValid = false;
            }

            if (!phoneRegex.test(fields.phone.value)) {
                showError(fields.phone, 'Số điện thoại không hợp lệ.');
                isValid = false;
            }

            if (!fields.username.value.trim()) {
                showError(fields.username, 'Vui lòng nhập tên đăng nhập.');
                isValid = false;
            }

            if (fields.password.value.length < 6) {
                showError(fields.password, 'Mật khẩu phải từ 6 ký tự.');
                isValid = false;
            }

            if (fields.password.value !== fields.confirm_password.value) {
                showError(fields.confirm_password, 'Mật khẩu nhập lại không khớp.');
                isValid = false;
            }

            if (!isValid) e.preventDefault();
        });
    }

    if (paymentContainer) {
        const btnThanhToan = paymentContainer.querySelector('button[type="button"]');

        if (btnThanhToan) {
            btnThanhToan.addEventListener('click', () => {
                let isValid = true;

                const selectedSeats = document.querySelectorAll('.seat.selected');

                if (selectedSeats.length === 0) {
                    alert('Bạn chưa chọn ghế nào trên sơ đồ!');
                    isValid = false;
                }

                const nameInput = document.querySelector('input[name="customer_name"]');
                const emailInput = document.querySelector('input[name="customer_email"]');
                const phoneInput = document.querySelector('input[name="customer_phone"]');

                [nameInput, emailInput, phoneInput].forEach(clearError);

                if (!nameInput || !nameInput.value.trim()) {
                    showError(nameInput, 'Vui lòng nhập họ tên.');
                    isValid = false;
                }

                if (!emailInput || !emailRegex.test(emailInput.value)) {
                    showError(emailInput, 'Email không hợp lệ.');
                    isValid = false;
                }

                if (!phoneInput || !phoneRegex.test(phoneInput.value)) {
                    showError(phoneInput, 'Số điện thoại không hợp lệ.');
                    isValid = false;
                }

                if (!isValid) return;

                mockPaymentAPI(btnThanhToan, selectedSeats.length);
            });
        }
    }
}

// ==========================================
// 5. MOCK SOCIAL LOGIN
// ==========================================
function mockSocialLogin(provider) {
    alert(`Đang chuyển hướng sang trang đăng nhập bằng ${provider}...`);

    setTimeout(() => {
        window.location.href = 'index.html';
    }, 1000);
}

// ==========================================
// 6. MOCK PAYMENT API
// ==========================================
function mockPaymentAPI(button, ticketCount) {
    button.textContent = 'Đang xử lý thanh toán...';
    button.disabled = true;
    button.style.backgroundColor = '#64748b';

    new Promise(resolve => {
        setTimeout(() => {
            resolve({
                status: 'Success',
                message: 'Thanh toán thành công'
            });
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

    if (!paymentContainer) return;

    const orderCode = 'ORD-' + Math.floor(Math.random() * 1000000);
    const qrCodeMock = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${orderCode}`;

    paymentContainer.innerHTML = `
        <section style="text-align: center; padding: 40px 0;">
            <h2 style="color: #10b981;">🎉 Mua vé thành công!</h2>

            <p>Mã đơn hàng của bạn: <strong>${orderCode}</strong></p>
            <p>Số lượng vé: <strong>${ticketCount}</strong></p>

            <div style="margin: 30px 0;">
                <img src="${qrCodeMock}" alt="QR Code Vé" style="border: 5px solid white; border-radius: 8px;">
                <p style="margin-top: 10px; color: var(--text-muted);">
                    Quét mã QR này tại cổng kiểm soát
                </p>
            </div>

            <div style="display: flex; gap: 15px; justify-content: center; margin-bottom: 30px; flex-wrap: wrap;">
                <button type="button" onclick="downloadTicketImage()" style="background-color: var(--primary);">
                    Tải ảnh vé về máy (.png)
                </button>

                <button type="button" onclick="sendTicketEmail()" style="background-color: transparent; border: 1px solid var(--primary); color: var(--primary) !important;">
                    Gửi file PDF về Email
                </button>
            </div>

            <a href="my-tickets.html#ticket" style="display: block; margin-bottom: 10px;">
                Xem lại vé của tôi
            </a>

            <a href="index.html">
                Quay lại trang chủ
            </a>
        </section>
    `;
}

function downloadTicketImage() {
    alert('Đang tạo hình ảnh vé...');

    setTimeout(() => {
        alert('Tải thành công! File ticket.png đã được lưu mô phỏng.');
    }, 1000);
}

function sendTicketEmail() {
    alert('Đang gửi vé điện tử PDF vào email của bạn...');

    setTimeout(() => {
        alert('Gửi Email thành công!');
    }, 1500);
}