// Lắng nghe khi DOM đã được tải hoàn chỉnh
document.addEventListener("DOMContentLoaded", () => {
  // Lấy phần tử form đăng nhập theo id
  const form = document.getElementById("login-form");
  // Lấy input tên đăng nhập
  const usernameInput = document.getElementById("username");
  // Lấy input mật khẩu
  const passwordInput = document.getElementById("password");
  // Lấy checkbox ghi nhớ đăng nhập
  const rememberInput = document.getElementById("remember");
  // Lấy ô hiển thị lỗi trên form
  const errorDiv = document.getElementById("login-error");

  // Nếu không tìm thấy form thì thoát
  if (!form) return;

  // Bắt sự kiện submit của form
  form.addEventListener("submit", (e) => {
    // Ngăn hành vi submit mặc định (tránh reload trang)
    e.preventDefault();
    // Xóa thông báo lỗi cũ
    errorDiv.textContent = "";

    // Lấy giá trị tên đăng nhập và loại bỏ khoảng trắng hai đầu
    const id = usernameInput.value.trim();
    // Lấy giá trị mật khẩu
    const pw = passwordInput.value;

    // Nếu thiếu tên đăng nhập hoặc mật khẩu thì báo lỗi
    if (!id || !pw) {
      errorDiv.textContent = "Vui lòng nhập tên đăng nhập và mật khẩu.";
      return;
    }

    // Khởi tạo mảng users rỗng
    let users = [];
    try {
      // Cố gắng đọc danh sách users từ localStorage (nếu đã có)
      users = JSON.parse(localStorage.getItem("users") || "[]");
    } catch (err) {
      // Nếu parse lỗi thì tiếp tục với mảng rỗng
      users = [];
    }

    // Tìm user khớp username hoặc email và mật khẩu
    const found = users.find(
      (u) => (u.username === id || u.email === id) && u.password === pw,
    );

    // Tài khoản demo dự phòng (dùng khi không có users trong localStorage)
    const demo = {
      username: "demo",
      email: "demo@example.com",
      password: "demo123",
      role: "customer",
    };

    // Nếu tìm thấy user trong danh sách thì hoàn tất đăng nhập
    if (found) {
      completeLogin(found);
      return;
    }

    // Nếu nhập đúng tài khoản demo thì dùng tài khoản demo
    if (id === demo.username && pw === demo.password) {
      completeLogin(demo);
      return;
    }

    // Nếu không khớp tài khoản nào thì hiển thị thông báo lỗi
    errorDiv.textContent = "Tên đăng nhập hoặc mật khẩu không đúng.";
  });

  // Hàm thực hiện hành vi khi đăng nhập thành công
  function completeLogin(user) {
    // Lấy trạng thái checkbox ghi nhớ
    const remember = rememberInput.checked;
    // Tạo payload user (không bao gồm mật khẩu)
    const payload = {
      username: user.username,
      email: user.email,
      role: user.role || "customer",
    };

    // Nếu chọn ghi nhớ thì lưu vào localStorage, ngược lại lưu vào sessionStorage
    if (remember) {
      localStorage.setItem("currentUser", JSON.stringify(payload));
    } else {
      sessionStorage.setItem("currentUser", JSON.stringify(payload));
    }

    // Chuyển hướng về trang chủ
    window.location.href = "index.html";
  }
});
