// ============================================================================
// LOGIC HỆ THỐNG DÙNG CHUNG (CƠ SỞ DỮ LIỆU LOCALSTORAGE, XÁC THỰC, NAVBAR & TÌM KIẾM)
// ============================================================================

// 1. KHỞI TẠO DỮ LIỆU MẪU BAN ĐẦU (DATABASE INITIALIZATION)

// Danh sách các sự kiện âm nhạc mặc định (3 sự kiện chính)
const DEFAULT_EVENTS = [
  {
    id: 1,
    code: 'EVT001',
    title: 'Liveshow Mùa Hè 2026',
    artist: 'Sơn Tùng M-TP, Hà Anh Tuấn, Mỹ Tâm',
    date: '20/06/2026',
    time: '19:30',
    location: 'Sân vận động Mỹ Đình, Hà Nội',
    minPrice: '300.000 VNĐ',
    banner: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?q=80&w=1200&auto=format&fit=crop',
    description: 'Liveshow ca nhạc hoành tráng nhất mùa hè năm 2026 quy tụ dàn sao cực khủng. Trải nghiệm hệ thống âm thanh, ánh sáng tiêu chuẩn quốc tế mang lại những giây phút thăng hoa âm nhạc khó quên.',
    ticketClasses: [
      { name: 'Standard', price: 300000, desc: 'Vé khán đài tầng 2, tầm nhìn rộng bao quát', available: 150 },
      { name: 'VIP', price: 1500000, desc: 'Vé khu vực sân cỏ gần sân khấu, tặng kèm nước uống', available: 50 },
      { name: 'VVIP', price: 3000000, desc: 'Vé hàng ghế đầu sát sân khấu, lối đi riêng, buffet nhẹ', available: 20 }
    ]
  },
  {
    id: 2,
    code: 'EVT002',
    title: 'Đêm nhạc Acoustic',
    artist: 'Vũ, Hà Anh Tuấn, Lê Cát Trọng Lý',
    date: '15/07/2026',
    time: '20:00',
    location: 'Nhà hát Lớn Hà Nội',
    minPrice: '250.000 VNĐ',
    banner: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?q=80&w=1200&auto=format&fit=crop',
    description: 'Không gian ấm cúng mang phong cách Acoustic nhẹ nhàng mộc mạc. Lắng nghe những bản tình ca sâu lắng hòa cùng giai điệu guitar và piano mộc mạc tại Nhà hát thành phố cổ kính.',
    ticketClasses: [
      { name: 'Standard', price: 250000, desc: 'Ghế ngồi tầng 2 và tầng 3 nhà hát', available: 80 },
      { name: 'VIP', price: 800000, desc: 'Ghế VIP hàng giữa tầng 1, tặng kèm CD ca sĩ chính', available: 30 }
    ]
  },
  {
    id: 3,
    code: 'EVT003',
    title: 'Music Night 2026',
    artist: 'Đen Vâu, Binz, Suboi, Touliver',
    date: '10/08/2026',
    time: '19:00',
    location: 'Nhà thi đấu Phú Thọ, TP.HCM',
    minPrice: '400.000 VNĐ',
    banner: 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?q=80&w=1200&auto=format&fit=crop',
    description: 'Đêm nhạc EDM và Hiphop bùng nổ năng lượng với dàn âm thanh bass cực mạnh. Sân khấu được thiết kế 360 độ hiện đại mang lại góc nhìn mãn nhãn cùng hiệu ứng laser đẳng cấp.',
    ticketClasses: [
      { name: 'Standard', price: 400000, desc: 'Vé đứng khu vực khán đài tự do', available: 200 },
      { name: 'VIP', price: 1200000, desc: 'Vé đứng khu Fanzone sát sân khấu', available: 80 },
      { name: 'VVIP', price: 2500000, desc: 'Khán đài VIP có ghế ngồi riêng, nước uống buffet', available: 15 }
    ]
  }
];

// Danh sách các tài khoản đăng nhập mẫu sẵn có trên hệ thống
const DEFAULT_USERS = [
  { fullname: 'Nguyễn Văn A', username: 'customer', password: '123', email: 'customer@qrbox.vn', phone: '0987654321', role: 'customer' },
  { fullname: 'Nhân Viên Soát Vé B', username: 'staff', password: '123', email: 'staff@qrbox.vn', phone: '0912345678', role: 'staff' },
  { fullname: 'Quản Trị Viên C', username: 'admin', password: '123456', email: 'admin@qrbox.vn', phone: '0900000000', role: 'admin' }
];

// Danh sách các vé đã được đặt mua mặc định ban đầu để hiển thị lịch sử check-in
const DEFAULT_TICKETS = [
  { code: 'TICKET-EVT001-001', eventCode: 'EVT001', eventTitle: 'Liveshow Mùa Hè 2026', owner: 'Nguyễn Văn A', time: '20/06/2026 - 19:30', location: 'Sân vận động Mỹ Đình, Hà Nội', class: 'VIP', status: 'unused', checkinTime: null, username: 'customer' },
  { code: 'TICKET-EVT002-001', eventCode: 'EVT002', eventTitle: 'Đêm nhạc Acoustic', owner: 'Trần Văn B', time: '15/07/2026 - 20:00', location: 'Nhà hát Lớn Hà Nội', class: 'Standard', status: 'used', checkinTime: '15/07/2026 19:20', username: 'customer' },
  { code: 'TICKET-EVT003-001', eventCode: 'EVT003', eventTitle: 'Music Night 2026', owner: 'Lê Văn C', time: '10/08/2026 - 19:00', location: 'Nhà thi đấu Phú Thọ, TP.HCM', class: 'VVIP', status: 'unused', checkinTime: null, username: 'customer' }
];

// Cấu hình ghi dữ liệu mặc định vào LocalStorage nếu trình duyệt chưa lưu trữ
if (!localStorage.getItem('events')) {
  localStorage.setItem('events', JSON.stringify(DEFAULT_EVENTS));
}
if (!localStorage.getItem('users')) {
  localStorage.setItem('users', JSON.stringify(DEFAULT_USERS));
}
if (!localStorage.getItem('tickets')) {
  localStorage.setItem('tickets', JSON.stringify(DEFAULT_TICKETS));
}

// 2. BỘ ĐIỀU KHIỂN HỘP THÔNG BÁO TẠM THỜI (TOAST NOTIFICATION)
// Hàm vẽ và hiển thị các thông báo dạng Toast nhỏ ở góc màn hình (success, danger, warning, info)
function showToast(message, type = 'info') {
  let container = document.querySelector('.toast-container-custom');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container-custom';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast-custom ${type}`;

  let icon = 'ℹ️';
  if (type === 'success') icon = '✅';
  else if (type === 'warning') icon = '⚠️';
  else if (type === 'danger') icon = '❌';

  toast.innerHTML = `
    <span>${icon}</span>
    <div>${message}</div>
  `;

  container.appendChild(toast);

  // Tự động biến mất sau 4 giây kèm hiệu ứng thu gọn
  setTimeout(() => {
    toast.style.animation = 'slideInCustom 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) reverse';
    toast.style.opacity = '0';
    setTimeout(() => {
      toast.remove();
      if (container.children.length === 0) {
        container.remove();
      }
    }, 300);
  }, 4000);
}

// 3. LOGIC KHỞI CHẠY NGAY KHI NẠP XONG TRANG (DOM CONTENT LOADED)
document.addEventListener('DOMContentLoaded', () => {
<<<<<<< Updated upstream
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
=======
  const events = JSON.parse(localStorage.getItem('events'));
  const users = JSON.parse(localStorage.getItem('users'));
  const currentUser = JSON.parse(localStorage.getItem('currentUser'));

  // Cập nhật trạng thái thanh menu (Navbar) dựa theo thông tin đăng nhập
  updateNavbar(currentUser);

  // Đăng ký sự kiện Click cho nút "Đăng xuất"
  const logoutBtn = document.querySelector('a[href="logout"]');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      localStorage.removeItem('currentUser'); // Xóa phiên đăng nhập khỏi LocalStorage
      showToast('Đăng xuất thành công!', 'success');
      setTimeout(() => {
        window.location.href = 'index.html'; // Chuyển hướng về trang chủ
      }, 1000);
    });
  }

  // Khởi tạo trình xử lý xác thực biểu mẫu cho trang Đăng nhập & Đăng ký
  handleLoginForm(users);
  handleRegisterForm(users);

  // Kích hoạt tính năng tìm kiếm trên thanh điều hướng Navbar
  handleNavbarSearch();

  // Kiểm tra nếu đang ở trang chủ (index.html), tự động vẽ danh sách các sự kiện
  if (document.getElementById('events')) {
    const searchParams = new URLSearchParams(window.location.search);
    const searchQuery = searchParams.get('search');
    
    // Điền sẵn từ khóa vào ô tìm kiếm nếu có tham số truy vấn từ trang khác
    const searchInput = document.querySelector('.search-form input');
    if (searchQuery && searchInput) {
      searchInput.value = searchQuery;
    }

    renderEventsList(events, searchQuery);
  }
});

// 4. CẬP NHẬT NAVBAR ĐỘNG THEO TÀI KHOẢN VÀ VAI TRÒ
function updateNavbar(currentUser) {
  const accountDropdown = document.getElementById('accountDropdown');
  if (!accountDropdown) return;

  const dropdownMenu = accountDropdown.nextElementSibling;
  if (!dropdownMenu) return;

  if (currentUser) {
    // Trường hợp đã đăng nhập: Hiển thị tên người dùng kèm chức vụ vai trò
    accountDropdown.innerHTML = `👤 ${currentUser.fullname} (${translateRole(currentUser.role)})`;
    
    dropdownMenu.innerHTML = `
      <li>
        <a class="dropdown-item" href="my-tickets.html#ticket">
          🎟️ Vé của bạn
        </a>
      </li>
    `;

    // Hiển thị các tính năng quản lý soát vé dành riêng cho Staff và Admin
    if (currentUser.role === 'staff' || currentUser.role === 'admin') {
      dropdownMenu.innerHTML += `
        <li>
          <a class="dropdown-item" href="admin-checkin.html#checkin">
            🛡️ Xác thực vé (Staff)
          </a>
        </li>
        <li>
          <a class="dropdown-item" href="admin-checkin.html#checkin-history">
            📋 Lịch sử check-in
          </a>
        </li>
      `;
    }

    dropdownMenu.innerHTML += `
      <li><hr class="dropdown-divider"></li>
      <li>
        <a class="dropdown-item text-danger" href="logout">
          🚪 Đăng xuất
        </a>
      </li>
    `;
  } else {
    // Trường hợp chưa đăng nhập: Hiển thị các nút đăng nhập, đăng ký
    accountDropdown.innerHTML = 'Tài khoản';
    dropdownMenu.innerHTML = `
      <li>
        <a class="dropdown-item" href="login.html">Đăng nhập</a>
      </li>
      <li>
        <a class="dropdown-item" href="register.html">Đăng ký</a>
      </li>
      <li><hr class="dropdown-divider"></li>
      <li>
        <a class="dropdown-item" href="my-tickets.html#ticket">Vé của bạn</a>
      </li>
    `;
  }
}

// Chuyển ngữ vai trò người dùng sang Tiếng Việt hiển thị
function translateRole(role) {
  switch (role) {
    case 'admin': return 'Admin';
    case 'staff': return 'Nhân viên soát vé';
    default: return 'Khách hàng';
  }
}

// 5. BIỂU MẪU ĐĂNG NHẬP (LOGIN VALIDATION & AUTHENTICATION)
function handleLoginForm(users) {
  const loginForm = document.getElementById('loginForm');
  if (!loginForm) return;

  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const usernameInput = loginForm.querySelector('input[name="username"]');
    const passwordInput = loginForm.querySelector('input[name="password"]');

    let valid = true;
    clearErrorStyles([usernameInput, passwordInput]);

    // Validation cơ bản
    if (!usernameInput.value.trim()) {
      showInputError(usernameInput, 'Vui lòng nhập email hoặc tên đăng nhập');
      valid = false;
    }
    if (!passwordInput.value.trim()) {
      showInputError(passwordInput, 'Vui lòng nhập mật khẩu');
      valid = false;
    }

    if (!valid) return;

    // So khớp thông tin đăng nhập trong danh sách LocalStorage
    const user = users.find(u => 
      (u.username === usernameInput.value.trim() || u.email === usernameInput.value.trim()) && 
      u.password === passwordInput.value
    );

    if (user) {
      // Lưu thông tin người dùng đăng nhập vào phiên hiện tại
      localStorage.setItem('currentUser', JSON.stringify(user));
      showToast(`Chào mừng ${user.fullname} đã quay trở lại!`, 'success');
      
      // Đọc URL chuyển hướng sau đăng nhập nếu có
      const params = new URLSearchParams(window.location.search);
      const redirectUrl = params.get('redirect');
      setTimeout(() => {
        window.location.href = redirectUrl ? decodeURIComponent(redirectUrl) : 'index.html';
      }, 1200);
    } else {
      showToast('Tên đăng nhập hoặc mật khẩu không chính xác', 'danger');
      showInputError(usernameInput, '');
      showInputError(passwordInput, 'Thông tin đăng nhập không hợp lệ');
    }
  });
}

// 6. BIỂU MẪU ĐĂNG KÝ (REGISTER VALIDATION & ROLE ASSIGNMENT)
function handleRegisterForm(users) {
  const registerForm = document.getElementById('registerForm');
  if (!registerForm) return;

  // Lấy các thẻ của tính năng cấp quyền Admin đặc biệt bằng mã xác thực 123456
  const isAdminCheckbox = document.getElementById('isAdminReg');
  const adminCodeWrapper = document.getElementById('adminCodeWrapper');
  const adminCodeInput = document.getElementById('adminCode');

  // Lắng nghe sự kiện Checkbox đăng ký Admin để ẩn/hiện ô điền mã xác thực
  if (isAdminCheckbox && adminCodeWrapper) {
    isAdminCheckbox.addEventListener('change', () => {
      if (isAdminCheckbox.checked) {
        adminCodeWrapper.style.display = 'block';
      } else {
        adminCodeWrapper.style.display = 'none';
        if (adminCodeInput) adminCodeInput.value = '';
      }
    });
  }

  registerForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const fullnameInput = registerForm.querySelector('input[name="fullname"]');
    const emailInput = registerForm.querySelector('input[name="email"]');
    const phoneInput = registerForm.querySelector('input[name="phone"]');
    const usernameInput = registerForm.querySelector('input[name="username"]');
    const passwordInput = registerForm.querySelector('input[name="password"]');
    const confirmPasswordInput = registerForm.querySelector('input[name="confirm_password"]');
    const agreeCheckbox = registerForm.querySelector('input[name="agree"]');

    // Gom danh sách các ô nhập liệu cần xóa kiểu cảnh báo đỏ khi nộp form mới
    const inputs = [fullnameInput, emailInput, phoneInput, usernameInput, passwordInput, confirmPasswordInput];
    if (adminCodeInput) inputs.push(adminCodeInput);
    
    clearErrorStyles(inputs);

    let valid = true;

    // Tiến hành kiểm tra dữ liệu đăng ký hợp lệ
    if (!fullnameInput.value.trim()) {
      showInputError(fullnameInput, 'Họ và tên không được để trống');
      valid = false;
    }
    if (!emailInput.value.trim() || !validateEmail(emailInput.value.trim())) {
      showInputError(emailInput, 'Email không hợp lệ');
      valid = false;
    }
    if (!phoneInput.value.trim()) {
      showInputError(phoneInput, 'Số điện thoại không được để trống');
      valid = false;
    }
    if (!usernameInput.value.trim() || usernameInput.value.trim().length < 4) {
      showInputError(usernameInput, 'Tên đăng nhập phải chứa ít nhất 4 ký tự');
      valid = false;
    }
    if (!passwordInput.value || passwordInput.value.length < 3) {
      showInputError(passwordInput, 'Mật khẩu phải chứa ít nhất 3 ký tự');
      valid = false;
    }
    if (passwordInput.value !== confirmPasswordInput.value) {
      showInputError(confirmPasswordInput, 'Mật khẩu nhập lại không khớp');
      valid = false;
    }
    if (!agreeCheckbox.checked) {
      showToast('Bạn phải đồng ý với điều khoản sử dụng', 'warning');
      valid = false;
    }

    // Nếu chọn Đăng ký làm Admin, kiểm tra mã xác thực xem có trùng khớp với '123456'
    if (isAdminCheckbox && isAdminCheckbox.checked && adminCodeInput) {
      if (adminCodeInput.value.trim() !== '123456') {
        showInputError(adminCodeInput, 'Mã xác thực Admin không chính xác!');
        valid = false;
      }
    }

    if (!valid) return;

    // Kiểm tra xem email hoặc tên đăng nhập đã được đăng ký trước đó chưa
    const exists = users.some(u => u.username === usernameInput.value.trim() || u.email === emailInput.value.trim());
    if (exists) {
      showToast('Tên đăng nhập hoặc email đã tồn tại trên hệ thống', 'danger');
      showInputError(usernameInput, 'Tên đăng nhập hoặc email bị trùng');
      return;
    }

    // Xác định vai trò đăng ký (Admin hoặc Khách hàng)
    const selectedRole = (isAdminCheckbox && isAdminCheckbox.checked) ? 'admin' : 'customer';

    // Tạo đối tượng tài khoản mới
    const newUser = {
      fullname: fullnameInput.value.trim(),
      username: usernameInput.value.trim(),
      password: passwordInput.value,
      email: emailInput.value.trim(),
      phone: phoneInput.value.trim(),
      role: selectedRole
    };

    // Đẩy tài khoản mới vào danh sách và cập nhật LocalStorage
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));

    showToast('Đăng ký tài khoản thành công!', 'success');
    setTimeout(() => {
      window.location.href = 'login.html'; // Chuyển hướng sang đăng nhập
    }, 1500);
  });
}

// 7. HÀM TÌM KIẾM SỰ KIỆN TRÊN THANH NAVBAR
function handleNavbarSearch() {
  const searchForm = document.querySelector('.search-form');
  if (!searchForm) return;

  searchForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const query = searchForm.querySelector('input').value.trim();
    
    // Nếu đang ở trang chủ (index.html), lọc trực tiếp trên giao diện không cần nạp lại trang
    if (document.getElementById('events')) {
      const events = JSON.parse(localStorage.getItem('events'));
      renderEventsList(events, query);
      
      // Đẩy từ khóa tìm kiếm lên thanh URL để lưu lịch sử duyệt
      const newUrl = window.location.protocol + "//" + window.location.host + window.location.pathname + `?search=${encodeURIComponent(query)}`;
      window.history.pushState({ path: newUrl }, '', newUrl);
    } else {
      // Nếu đang ở trang khác, chuyển hướng về trang chủ kèm theo tham số tìm kiếm
      window.location.href = `index.html?search=${encodeURIComponent(query)}`;
    }
  });
}

// 8. RENDER DANH SÁCH THẺ SỰ KIỆN Ở TRANG CHỦ INDEX.HTML
function renderEventsList(events, query = '') {
  const container = document.querySelector('#events .row.g-4');
  if (!container) return;

  // Lọc sự kiện theo từ khóa tìm kiếm (hỗ trợ tìm theo tiêu đề, nghệ sĩ, địa điểm)
  let filteredEvents = events;
  if (query) {
    const q = query.toLowerCase();
    filteredEvents = events.filter(e => 
      e.title.toLowerCase().includes(q) || 
      e.artist.toLowerCase().includes(q) || 
      e.location.toLowerCase().includes(q)
    );
  }

  // Hiển thị giao diện trống nếu không tìm thấy sự kiện khớp từ khóa
  if (filteredEvents.length === 0) {
    container.innerHTML = `
      <div class="col-12 text-center py-5">
        <p class="text-muted fs-4">Không tìm thấy sự kiện nào khớp với từ khóa "${query}"</p>
        <button class="btn btn-outline-primary mt-2" onclick="resetSearch()">Xem tất cả sự kiện</button>
      </div>
    `;
    return;
  }

  // Khởi tạo lại container sự kiện
  container.innerHTML = '';
  filteredEvents.forEach(evt => {
    let badgeClass = 'bg-primary';
    if (evt.code === 'EVT002') badgeClass = 'bg-success';
    if (evt.code === 'EVT003') badgeClass = 'bg-warning text-dark';

    const cardHtml = `
      <div class="col-12 col-md-6 col-lg-4">
        <article class="event-card">
          <div class="event-card-body">
            <span class="event-badge ${badgeClass}">
              ${evt.code}
            </span>

            <h2>
              ${evt.title}
            </h2>

            <ul class="event-info">
              <li><strong>Ca sĩ:</strong> <span>${evt.artist.split(',')[0]}...</span></li>
              <li><strong>Thời gian:</strong> <span>${evt.date}</span></li>
              <li><strong>Địa điểm:</strong> <span>${evt.location.split(',')[0]}</span></li>
              <li>
                <strong>Giá vé:</strong>
                <span>Từ ${evt.minPrice}</span>
              </li>
            </ul>

            <div class="event-actions">
              <a href="event-details.html?id=${evt.id}" class="btn btn-outline-primary">
                Chi tiết
              </a>

              <a href="payment-page.html?id=${evt.code}" class="btn btn-primary">
                Mua vé
              </a>
            </div>

          </div>
        </article>
      </div>
    `;
    container.innerHTML += cardHtml;
  });
}

// Đặt lại ô tìm kiếm và hiển thị toàn bộ sự kiện
function resetSearch() {
  const searchInput = document.querySelector('.search-form input');
  if (searchInput) searchInput.value = '';
  const events = JSON.parse(localStorage.getItem('events'));
  renderEventsList(events, '');
  window.history.pushState({ path: 'index.html' }, '', 'index.html');
}

// 9. TIỆN ÍCH HIỂN THỊ CẢNH BÁO LỖI FORM CỦA INPUT
function showInputError(input, message) {
  if (!input) return;
  input.classList.add('is-invalid');
  
  let errorEl = input.parentElement.querySelector('.error-feedback');
  if (!errorEl) {
    errorEl = document.createElement('div');
    errorEl.className = 'error-feedback';
    input.parentElement.appendChild(errorEl);
  }
  errorEl.textContent = message;
  errorEl.style.display = 'block';
}

// Xóa bỏ các cảnh báo viền đỏ trên các ô input
function clearErrorStyles(inputs) {
  inputs.forEach(input => {
    if (!input) return;
    input.classList.remove('is-invalid');
    const errorEl = input.parentElement.querySelector('.error-feedback');
    if (errorEl) {
      errorEl.style.display = 'none';
      errorEl.textContent = '';
    }
  });
}

// Kiểm tra định dạng email bằng regex
function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
>>>>>>> Stashed changes
}
