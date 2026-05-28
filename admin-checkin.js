<<<<<<< HEAD
document.addEventListener('DOMContentLoaded', () => {
  const currentUser = JSON.parse(localStorage.getItem('currentUser'));
  const accessDeniedEl = document.getElementById('access-denied');
  const adminContentEl = document.getElementById('admin-checkin-content');
  if (!currentUser || (currentUser.role !== 'staff' && currentUser.role !== 'admin')) {
    if (accessDeniedEl) accessDeniedEl.classList.remove('d-none');
    if (adminContentEl) adminContentEl.classList.add('d-none');
    return;
  }

  if (accessDeniedEl) accessDeniedEl.classList.add('d-none');
  if (adminContentEl) adminContentEl.classList.remove('d-none');
  const adminUsernameText = document.getElementById('adminUsernameText');
  const adminRoleText = document.getElementById('adminRoleText');

  if (adminUsernameText) adminUsernameText.textContent = currentUser.fullname;
  if (adminRoleText) {
    adminRoleText.textContent = translateRole(currentUser.role);
    if (currentUser.role === 'admin') {
      adminRoleText.className = 'ticket-status status-used';
    } else {
      adminRoleText.className = 'ticket-status status-unused';
    }
  }
  updateDashboardStats();
  renderAdminTicketsTable();
  renderAdminEventsTable();
  setupScanSimulation();
  setupManualCheckin();
  setupEventManagement();
});
function translateRole(role) {
  if (role === 'admin') return 'Quản trị viên (Admin)';
  if (role === 'staff') return 'Nhân viên soát vé (Staff)';
  return 'Khách hàng';
}

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
function renderAdminTicketsTable() {
  const tableBody = document.getElementById('adminTicketTableBody');
  if (!tableBody) return;

  const tickets = JSON.parse(localStorage.getItem('tickets')) || [];

  if (tickets.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="8" class="text-center text-muted">Chưa có vé nào được mua trên hệ thống.</td>
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
    const actionButton = isUnused
      ? `<button type="button" class="btn btn-sm btn-primary" onclick="adminTriggerCheckin('${t.code}')">Check-in</button>`
      : `<button type="button" class="btn btn-sm btn-outline-danger" onclick="adminUndoCheckin('${t.code}')">Hoàn tác</button>`;

    const rowHtml = `
      <tr>
        <td><strong>${t.code}</strong></td>
        <td>${t.owner}</td>
        <td>${t.eventTitle}</td>
        <td><span class="badge bg-secondary">${t.class}</span></td>
        <td><span class="text-warning font-weight-bold">${t.seat || '-'}</span></td>
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
function setupScanSimulation() {
  const startScanBtn = document.getElementById('startScanBtn');
  const stopScanBtn = document.getElementById('stopScanBtn');
  const readerEl = document.getElementById('admin-reader');

  if (!startScanBtn || !stopScanBtn || !readerEl) return;
  startScanBtn.addEventListener('click', () => {
    readerEl.innerHTML = '';

    if (!html5QrCode) {
      html5QrCode = new Html5Qrcode("admin-reader");
    }

    const config = {
      fps: 15,
      qrbox: (width, height) => {
        const minSize = Math.min(width, height);
        const qrboxSize = Math.floor(minSize * 0.7);
        return { width: qrboxSize, height: qrboxSize };
      }
    };

    html5QrCode.start(
      { facingMode: "environment" },
      config,
      (decodedText, decodedResult) => {
        console.log("Mã quét được:", decodedText);

        let ticketCode = decodedText;
        if (decodedText.includes('TICKET_CODE:')) {
          const parts = decodedText.split('|');
          const codePart = parts.find(p => p.startsWith('TICKET_CODE:'));
          if (codePart) {
            ticketCode = codePart.replace('TICKET_CODE:', '');
          }
        }

        verifyAndProcessCheckin(ticketCode);
        if (navigator.vibrate) {
          navigator.vibrate(200);
        }
      },
      (errorMessage) => {

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
}
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

    verifyAndProcessCheckin(enteredCode);
    input.value = '';
  });
}

function verifyAndProcessCheckin(ticketCode) {
  const resultBox = document.getElementById('checkinResultBox');
  if (!resultBox) return;

  const tickets = JSON.parse(localStorage.getItem('tickets')) || [];
  const ticketIndex = tickets.findIndex(t => t.code.toUpperCase() === ticketCode.toUpperCase());

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
  const now = new Date();
  const formatTime = now.toLocaleString('vi-VN');

  ticket.status = 'used';
  ticket.checkinTime = formatTime;
  localStorage.setItem('tickets', JSON.stringify(tickets));
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

  updateDashboardStats();
  renderAdminTicketsTable();
}
window.adminTriggerCheckin = function (ticketCode) {
  verifyAndProcessCheckin(ticketCode);
};

window.adminUndoCheckin = function (ticketCode) {
  const tickets = JSON.parse(localStorage.getItem('tickets')) || [];
  const ticketIndex = tickets.findIndex(t => t.code === ticketCode);

  if (ticketIndex === -1) return;

  const ticket = tickets[ticketIndex];

  ticket.status = 'unused';
  ticket.checkinTime = null;

  localStorage.setItem('tickets', JSON.stringify(tickets));

  if (typeof showToast === 'function') {
    showToast(`Đã hoàn tác check-in cho vé ${ticketCode}`, 'success');
  }

  updateDashboardStats();
  renderAdminTicketsTable();

  const resultBox = document.getElementById('checkinResultBox');
  if (resultBox) {
    resultBox.className = 'checkin-result-box';
    resultBox.innerHTML = `<p>Đã hoàn tác soát vé ${ticketCode}. Sẵn sàng kiểm tra lượt mới.</p>`;
  }
};

function renderAdminEventsTable() {
  const tableBody = document.getElementById('adminEventsTableBody');
  if (!tableBody) return;

  const events = JSON.parse(localStorage.getItem('events')) || [];

  if (events.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="6" class="text-center text-muted">Chưa có sự kiện nào trong hệ thống.</td>
      </tr>
    `;
    return;
  }

  tableBody.innerHTML = '';
    // helper to resolve banner src (supports storedImages mapping)
    function resolveBannerSrc(banner) {
      try {
        const imgs = JSON.parse(localStorage.getItem('storedImages') || '{}');
        if (banner && banner.startsWith('image/') && imgs[banner]) return imgs[banner];
      } catch (e) {
        // ignore parse errors
      }
      return banner;
    }

    events.forEach(evt => {
      const categoryText = evt.category ? evt.category : '-';
      const rowHtml = `
      <tr>
        <td>
          <img src="${resolveBannerSrc(evt.banner)}" alt="${evt.title}" width="48" height="48" style="object-fit: cover; border-radius: 6px;">
        </td>
        <td><strong>${evt.code}</strong></td>
        <td>${evt.title}</td>
        <td>${evt.artist}</td>
        <td>${categoryText}</td>
        <td>${evt.date} - ${evt.time}</td>
        <td>
          <div class="d-flex gap-2">
            <button type="button" class="btn btn-sm btn-outline-secondary" onclick="adminEditEvent(${evt.id})">Sửa</button>
            <button type="button" class="btn btn-sm btn-outline-danger" onclick="adminDeleteEvent(${evt.id})">Xóa</button>
          </div>
        </td>
      </tr>
    `;
      tableBody.innerHTML += rowHtml;
    });
}

function setupEventManagement() {
  const form = document.getElementById('addEventForm');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const codeInput = document.getElementById('evtCode');
      const titleInput = document.getElementById('evtTitle');
      const artistInput = document.getElementById('evtArtist');
      const dateInput = document.getElementById('evtDate');
      const timeInput = document.getElementById('evtTime');
      const locationInput = document.getElementById('evtLocation');
      const categoryInput = document.getElementById('evtCategory');
      const bannerInput = document.getElementById('evtBanner');
      const descInput = document.getElementById('evtDescription');

      const priceStandard = parseInt(document.getElementById('priceStandard').value, 10) || 0;
      const priceVIP = parseInt(document.getElementById('priceVIP').value, 10) || 0;
      const priceVVIP = parseInt(document.getElementById('priceVVIP').value, 10) || 0;

      const events = JSON.parse(localStorage.getItem('events')) || [];
      const codeVal = codeInput.value.trim().toUpperCase();
      // prevent duplicate code unless editing the same event
      const editingId = form.getAttribute('data-edit-id');
      const duplicate = events.some(evt => evt.code === codeVal && String(evt.id) !== String(editingId || ''));
      if (duplicate) {
        if (typeof showToast === 'function') {
          showToast('Lỗi: Mã sự kiện đã tồn tại!', 'danger');
        }
        return;
      }
      const newId = events.length > 0 ? Math.max(...events.map(e => e.id)) + 1 : 1;
      const ticketClasses = [
        { name: 'Standard', price: priceStandard, desc: 'Vé Standard vị trí khán đài tự do', available: 100 },
        { name: 'VIP', price: priceVIP, desc: 'Vé VIP gần sân khấu, tặng nước uống', available: 50 },
        { name: 'VVIP', price: priceVVIP, desc: 'Vé VVIP hàng đầu sát sân khấu, buffet nhẹ', available: 20 }
      ];
      const minPriceVal = Math.min(priceStandard, priceVIP, priceVVIP).toLocaleString('vi-VN') + ' VNĐ';

      const newEvent = {
        id: newId,
        code: codeVal,
        title: titleInput.value.trim(),
        artist: artistInput.value.trim(),
        category: categoryInput ? categoryInput.value.trim() : '',
        date: dateInput.value.trim(),
        time: timeInput.value.trim(),
        location: locationInput.value.trim(),
        minPrice: minPriceVal,
        banner: bannerInput.value.trim(),
        description: descInput.value.trim(),
        ticketClasses: ticketClasses
      };
      // detect edit mode
      if (editingId) {
        const idx = events.findIndex(e => e.id === parseInt(editingId, 10));
        if (idx !== -1) {
          newEvent.id = parseInt(editingId, 10);
          events[idx] = newEvent;
        } else {
          events.push(newEvent);
        }
        form.removeAttribute('data-edit-id');
      } else {
        events.push(newEvent);
      }
      localStorage.setItem('events', JSON.stringify(events));

      form.reset();
      const bannerPreview = document.getElementById('evtBannerPreview');
      const bannerFileInput = document.getElementById('evtBannerFile');
      if (bannerPreview) { bannerPreview.src = ''; bannerPreview.style.display = 'none'; }
      if (bannerFileInput) { bannerFileInput.value = ''; }
      // clear hidden date picker value
      const evtDatePickerEl = document.getElementById('evtDatePicker');
      if (evtDatePickerEl) evtDatePickerEl.value = '';
      renderAdminEventsTable();

      // reset form state and buttons
      const eventFormTitle = document.getElementById('eventFormTitle');
      const eventFormSubmitBtn = document.getElementById('eventFormSubmitBtn');
      const cancelEditBtn = document.getElementById('cancelEditBtn');
      if (eventFormTitle) eventFormTitle.textContent = 'Thêm sự kiện mới';
      if (eventFormSubmitBtn) eventFormSubmitBtn.textContent = 'Tạo Sự Kiện';
      if (cancelEditBtn) cancelEditBtn.classList.add('d-none');

      if (typeof showToast === 'function') {
        showToast(`Đã thêm sự kiện "${newEvent.title}" thành công!`, 'success');
      }
    });
  }
  const presetBtns = document.querySelectorAll('.preset-banner-btn');
  presetBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const url = btn.getAttribute('data-url');
      const bannerInput = document.getElementById('evtBanner');
      const bannerPreview = document.getElementById('evtBannerPreview');
      if (bannerInput) {
        bannerInput.value = url;
      }
      if (bannerPreview) {
        bannerPreview.src = url;
        bannerPreview.style.display = 'inline-block';
      }
      const bannerFileInput = document.getElementById('evtBannerFile');
      if (bannerFileInput) bannerFileInput.value = '';
    });
  });

  // Xử lý upload ảnh từ bộ nhớ thiết bị của người dùng
  const bannerFileInputEl = document.getElementById('evtBannerFile');
  const bannerPreviewEl = document.getElementById('evtBannerPreview');
  if (bannerFileInputEl) {
    bannerFileInputEl.addEventListener('change', () => {
      const file = bannerFileInputEl.files && bannerFileInputEl.files[0];
      if (!file) return;

      const bannerInput = document.getElementById('evtBanner');
      const reader = new FileReader();
      
      // Đọc file ảnh và chuyển đổi thành chuỗi Base64 DataURL
      reader.onload = (e) => {
        const dataUrl = e.target.result;
        
        // Tạo đường dẫn giả lập độc nhất cho ảnh để lưu trữ thông tin
        const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
        const bannerPath = `image/events/${Date.now()}_${safeName}`;
        
        try {
          // Lưu dữ liệu Base64 của ảnh vào localStorage dưới key 'storedImages'
          const imgs = JSON.parse(localStorage.getItem('storedImages') || '{}');
          imgs[bannerPath] = dataUrl;
          localStorage.setItem('storedImages', JSON.stringify(imgs));
        } catch (err) {
          console.error('Could not store image mapping', err);
          if (typeof showToast === 'function') {
            showToast('Không thể lưu ảnh: Bộ nhớ localStorage đầy!', 'danger');
          }
        }
        
        // Gán đường dẫn giả lập vào input text để lưu cùng thông tin sự kiện
        if (bannerInput) bannerInput.value = bannerPath;
        
        // Hiển thị ảnh xem trước ngay trên giao diện
        if (bannerPreviewEl) {
          bannerPreviewEl.src = dataUrl;
          bannerPreviewEl.style.display = 'inline-block';
        }
      };
      
      // Kích hoạt tiến trình đọc file
      reader.readAsDataURL(file);
    });
  }

  // Sync manual date input with hidden date picker and open native picker via button
  const evtDateBtn = document.getElementById('evtDateBtn');
  const evtDatePicker = document.getElementById('evtDatePicker');
  const evtDateInput = document.getElementById('evtDate');
  function ddmmyyyyToYyyymmdd(s) {
    const m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (!m) return null;
    const d = m[1].padStart(2, '0');
    const mo = m[2].padStart(2, '0');
    const y = m[3];
    return `${y}-${mo}-${d}`;
  }
  function yyyyMMddToDDMMYYYY(s) {
    if (!s) return '';
    const parts = s.split('-');
    if (parts.length !== 3) return '';
    const y = parts[0], mo = parts[1], d = parts[2];
    return `${d.padStart(2,'0')}/${mo.padStart(2,'0')}/${y}`;
  }
  if (evtDateBtn && evtDatePicker) {
    evtDateBtn.addEventListener('click', () => {
      const useShowPicker = typeof evtDatePicker.showPicker === 'function';
      if (useShowPicker) {
        evtDatePicker.showPicker();
        return;
      }

      const rect = evtDateBtn.getBoundingClientRect();
      evtDatePicker.style.position = 'absolute';
      evtDatePicker.style.left = `${rect.left}px`;
      evtDatePicker.style.top = `${rect.top}px`;
      evtDatePicker.style.width = `${Math.max(rect.width, 1)}px`;
      evtDatePicker.style.height = `${Math.max(rect.height, 1)}px`;
      evtDatePicker.style.opacity = '0';
      evtDatePicker.style.pointerEvents = 'auto';
      evtDatePicker.style.zIndex = '9999';
      document.body.appendChild(evtDatePicker);
      evtDatePicker.focus();
      evtDatePicker.click();

      setTimeout(() => {
        evtDatePicker.style.pointerEvents = 'none';
        evtDatePicker.style.zIndex = '';
        evtDatePicker.style.left = '0';
        evtDatePicker.style.top = '0';
        evtDatePicker.style.width = '1px';
        evtDatePicker.style.height = '1px';
      }, 300);
    });
    evtDatePicker.addEventListener('change', () => {
      if (evtDateInput) evtDateInput.value = yyyyMMddToDDMMYYYY(evtDatePicker.value);
    });
  }
  if (evtDateInput && evtDatePicker) {
    evtDateInput.addEventListener('blur', () => {
      const v = evtDateInput.value.trim();
      const conv = ddmmyyyyToYyyymmdd(v);
      if (conv) evtDatePicker.value = conv;
    });
  }
}
window.adminDeleteEvent = function(eventId) {
  if (!confirm('Bạn có chắc chắn muốn xóa sự kiện này không?')) return;

  const events = JSON.parse(localStorage.getItem('events')) || [];
  const eventIndex = events.findIndex(e => e.id === eventId);
  if (eventIndex === -1) return;

  const deletedTitle = events[eventIndex].title;
  // remove stored image mapping if present
  try {
    const evtBanner = events[eventIndex].banner;
    if (evtBanner && evtBanner.startsWith('image/')) {
      const imgs = JSON.parse(localStorage.getItem('storedImages') || '{}');
      if (imgs[evtBanner]) {
        delete imgs[evtBanner];
        localStorage.setItem('storedImages', JSON.stringify(imgs));
      }
    }
  } catch (e) {
    // ignore
  }

  events.splice(eventIndex, 1);
  localStorage.setItem('events', JSON.stringify(events));

  renderAdminEventsTable();

  if (typeof showToast === 'function') {
    showToast(`Đã xóa sự kiện "${deletedTitle}" thành công!`, 'success');
  }
};

window.adminEditEvent = function(eventId) {
  const events = JSON.parse(localStorage.getItem('events')) || [];
  const evt = events.find(e => e.id === eventId);
  if (!evt) return;

  const form = document.getElementById('addEventForm');
  if (!form) return;

  // populate fields
  document.getElementById('evtCode').value = evt.code || '';
  document.getElementById('evtTitle').value = evt.title || '';
  document.getElementById('evtArtist').value = evt.artist || '';
  document.getElementById('evtDate').value = evt.date || '';
  document.getElementById('evtTime').value = evt.time || '';
  document.getElementById('evtLocation').value = evt.location || '';
  document.getElementById('evtCategory').value = evt.category || '';
  document.getElementById('evtDescription').value = evt.description || '';

  // ticket classes
  const standard = evt.ticketClasses && evt.ticketClasses[0] ? evt.ticketClasses[0].price : 0;
  const vip = evt.ticketClasses && evt.ticketClasses[1] ? evt.ticketClasses[1].price : 0;
  const vvip = evt.ticketClasses && evt.ticketClasses[2] ? evt.ticketClasses[2].price : 0;
  document.getElementById('priceStandard').value = standard;
  document.getElementById('priceVIP').value = vip;
  document.getElementById('priceVVIP').value = vvip;

  // banner
  const bannerInput = document.getElementById('evtBanner');
  const bannerPreview = document.getElementById('evtBannerPreview');
  if (bannerInput) bannerInput.value = evt.banner || '';
  if (bannerPreview) {
    try {
      const imgs = JSON.parse(localStorage.getItem('storedImages') || '{}');
      if (evt.banner && evt.banner.startsWith('image/') && imgs[evt.banner]) {
        bannerPreview.src = imgs[evt.banner];
        bannerPreview.style.display = 'inline-block';
      } else if (evt.banner) {
        bannerPreview.src = evt.banner;
        bannerPreview.style.display = 'inline-block';
      } else {
        bannerPreview.src = '';
        bannerPreview.style.display = 'none';
      }
    } catch (e) {
      bannerPreview.src = evt.banner || '';
      bannerPreview.style.display = evt.banner ? 'inline-block' : 'none';
    }
  }

  // set edit mode
  form.setAttribute('data-edit-id', String(evt.id));
  const eventFormTitle = document.getElementById('eventFormTitle');
  const eventFormSubmitBtn = document.getElementById('eventFormSubmitBtn');
  const cancelEditBtn = document.getElementById('cancelEditBtn');
  if (eventFormTitle) eventFormTitle.textContent = `Sửa sự kiện: ${evt.title}`;
  if (eventFormSubmitBtn) eventFormSubmitBtn.textContent = 'Lưu thay đổi';
  if (cancelEditBtn) cancelEditBtn.classList.remove('d-none');
  // scroll to form
  eventFormTitle.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

// handle cancel edit
document.addEventListener('DOMContentLoaded', () => {
  const cancelEditBtn = document.getElementById('cancelEditBtn');
  if (cancelEditBtn) {
    cancelEditBtn.addEventListener('click', () => {
      const form = document.getElementById('addEventForm');
      if (!form) return;
      form.removeAttribute('data-edit-id');
      form.reset();
      const bannerPreview = document.getElementById('evtBannerPreview');
      if (bannerPreview) { bannerPreview.src = ''; bannerPreview.style.display = 'none'; }
      const eventFormTitle = document.getElementById('eventFormTitle');
      const eventFormSubmitBtn = document.getElementById('eventFormSubmitBtn');
      if (eventFormTitle) eventFormTitle.textContent = 'Thêm sự kiện mới';
      if (eventFormSubmitBtn) eventFormSubmitBtn.textContent = 'Tạo Sự Kiện';
      cancelEditBtn.classList.add('d-none');
    });
  }
});
=======
document.addEventListener('DOMContentLoaded', () => {
  const currentUser = JSON.parse(localStorage.getItem('currentUser'));
  const accessDeniedEl = document.getElementById('access-denied');
  const adminContentEl = document.getElementById('admin-checkin-content');
  if (!currentUser || (currentUser.role !== 'staff' && currentUser.role !== 'admin')) {
    if (accessDeniedEl) accessDeniedEl.classList.remove('d-none');
    if (adminContentEl) adminContentEl.classList.add('d-none');
    return;
  }

  if (accessDeniedEl) accessDeniedEl.classList.add('d-none');
  if (adminContentEl) adminContentEl.classList.remove('d-none');
  const adminUsernameText = document.getElementById('adminUsernameText');
  const adminRoleText = document.getElementById('adminRoleText');

  if (adminUsernameText) adminUsernameText.textContent = currentUser.fullname;
  if (adminRoleText) {
    adminRoleText.textContent = translateRole(currentUser.role);
    if (currentUser.role === 'admin') {
      adminRoleText.className = 'ticket-status status-used';
    } else {
      adminRoleText.className = 'ticket-status status-unused';
    }
  }
  updateDashboardStats();
  renderAdminTicketsTable();
  renderAdminEventsTable();
  setupScanSimulation();
  setupManualCheckin();
  setupEventManagement();
});
function translateRole(role) {
  if (role === 'admin') return 'Quản trị viên (Admin)';
  if (role === 'staff') return 'Nhân viên soát vé (Staff)';
  return 'Khách hàng';
}

let imageDirectoryHandle = null;

async function getImageDirectoryHandle() {
  if (imageDirectoryHandle) return imageDirectoryHandle;
  if (!window.showDirectoryPicker) return null;

  try {
    imageDirectoryHandle = await window.showDirectoryPicker({ mode: 'readwrite' });
    return imageDirectoryHandle;
  } catch (err) {
    console.warn('Directory picker canceled or unsupported:', err);
    return null;
  }
}

async function saveFileToImageFolder(file) {
  const dir = await getImageDirectoryHandle();
  if (!dir) return null;

  let targetDir = dir;
  try {
    if (dir.name === 'image') {
      targetDir = await dir.getDirectoryHandle('events', { create: true });
    } else if (dir.name !== 'events') {
      try {
        targetDir = await dir.getDirectoryHandle('events', { create: true });
      } catch (e) {
        // keep using selected dir if subdirectory creation not allowed
      }
    }
  } catch (e) {
    console.warn('Could not resolve events subfolder, using selected directory:', e);
  }

  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  try {
    const handle = await targetDir.getFileHandle(safeName, { create: true });
    const writable = await handle.createWritable();
    await writable.write(file);
    await writable.close();
    return `image/events/${safeName}`;
  } catch (err) {
    console.error('Could not save image to folder:', err);
    return null;
  }
}

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
function renderAdminTicketsTable() {
  const tableBody = document.getElementById('adminTicketTableBody');
  if (!tableBody) return;

  const tickets = JSON.parse(localStorage.getItem('tickets')) || [];

  if (tickets.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="8" class="text-center text-muted">Chưa có vé nào được mua trên hệ thống.</td>
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
    const actionButton = isUnused
      ? `<button type="button" class="btn btn-sm btn-primary" onclick="adminTriggerCheckin('${t.code}')">Check-in</button>`
      : `<button type="button" class="btn btn-sm btn-outline-danger" onclick="adminUndoCheckin('${t.code}')">Hoàn tác</button>`;

    const rowHtml = `
      <tr>
        <td><strong>${t.code}</strong></td>
        <td>${t.owner}</td>
        <td>${t.eventTitle}</td>
        <td><span class="badge bg-secondary">${t.class}</span></td>
        <td><span class="text-warning font-weight-bold">${t.seat || '-'}</span></td>
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
function setupScanSimulation() {
  const startScanBtn = document.getElementById('startScanBtn');
  const stopScanBtn = document.getElementById('stopScanBtn');
  const readerEl = document.getElementById('admin-reader');

  if (!startScanBtn || !stopScanBtn || !readerEl) return;
  startScanBtn.addEventListener('click', () => {
    readerEl.innerHTML = '';

    if (!html5QrCode) {
      html5QrCode = new Html5Qrcode("admin-reader");
    }

    const config = {
      fps: 15,
      qrbox: (width, height) => {
        const minSize = Math.min(width, height);
        const qrboxSize = Math.floor(minSize * 0.7);
        return { width: qrboxSize, height: qrboxSize };
      }
    };

    html5QrCode.start(
      { facingMode: "environment" },
      config,
      (decodedText, decodedResult) => {
        console.log("Mã quét được:", decodedText);

        let ticketCode = decodedText;
        if (decodedText.includes('TICKET_CODE:')) {
          const parts = decodedText.split('|');
          const codePart = parts.find(p => p.startsWith('TICKET_CODE:'));
          if (codePart) {
            ticketCode = codePart.replace('TICKET_CODE:', '');
          }
        }

        verifyAndProcessCheckin(ticketCode);
        if (navigator.vibrate) {
          navigator.vibrate(200);
        }
      },
      (errorMessage) => {

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
}
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

    verifyAndProcessCheckin(enteredCode);
    input.value = '';
  });
}

function verifyAndProcessCheckin(ticketCode) {
  const resultBox = document.getElementById('checkinResultBox');
  if (!resultBox) return;

  const tickets = JSON.parse(localStorage.getItem('tickets')) || [];
  const ticketIndex = tickets.findIndex(t => t.code.toUpperCase() === ticketCode.toUpperCase());

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
  const now = new Date();
  const formatTime = now.toLocaleString('vi-VN');

  ticket.status = 'used';
  ticket.checkinTime = formatTime;
  localStorage.setItem('tickets', JSON.stringify(tickets));
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

  updateDashboardStats();
  renderAdminTicketsTable();
}
window.adminTriggerCheckin = function (ticketCode) {
  verifyAndProcessCheckin(ticketCode);
};

window.adminUndoCheckin = function (ticketCode) {
  const tickets = JSON.parse(localStorage.getItem('tickets')) || [];
  const ticketIndex = tickets.findIndex(t => t.code === ticketCode);

  if (ticketIndex === -1) return;

  const ticket = tickets[ticketIndex];

  ticket.status = 'unused';
  ticket.checkinTime = null;

  localStorage.setItem('tickets', JSON.stringify(tickets));

  if (typeof showToast === 'function') {
    showToast(`Đã hoàn tác check-in cho vé ${ticketCode}`, 'success');
  }

  updateDashboardStats();
  renderAdminTicketsTable();

  const resultBox = document.getElementById('checkinResultBox');
  if (resultBox) {
    resultBox.className = 'checkin-result-box';
    resultBox.innerHTML = `<p>Đã hoàn tác soát vé ${ticketCode}. Sẵn sàng kiểm tra lượt mới.</p>`;
  }
};

function renderAdminEventsTable() {
  const tableBody = document.getElementById('adminEventsTableBody');
  if (!tableBody) return;

  const events = JSON.parse(localStorage.getItem('events')) || [];

  if (events.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="6" class="text-center text-muted">Chưa có sự kiện nào trong hệ thống.</td>
      </tr>
    `;
    return;
  }

  tableBody.innerHTML = '';
    // helper to resolve banner src (supports storedImages mapping)
    function resolveBannerSrc(banner) {
      try {
        const imgs = JSON.parse(localStorage.getItem('storedImages') || '{}');
        if (banner && banner.startsWith('image/') && imgs[banner]) return imgs[banner];
      } catch (e) {
        // ignore parse errors
      }
      return banner;
    }

    events.forEach(evt => {
      const categoryText = evt.category ? evt.category : '-';
      const rowHtml = `
      <tr>
        <td>
          <img src="${resolveBannerSrc(evt.banner)}" alt="${evt.title}" width="48" height="48" style="object-fit: cover; border-radius: 6px;">
        </td>
        <td><strong>${evt.code}</strong></td>
        <td>${evt.title}</td>
        <td>${evt.artist}</td>
        <td>${categoryText}</td>
        <td>${evt.date} - ${evt.time}</td>
        <td>
          <div class="d-flex gap-2">
            <button type="button" class="btn btn-sm btn-outline-secondary" onclick="adminEditEvent(${evt.id})">Sửa</button>
            <button type="button" class="btn btn-sm btn-outline-danger" onclick="adminDeleteEvent(${evt.id})">Xóa</button>
          </div>
        </td>
      </tr>
    `;
      tableBody.innerHTML += rowHtml;
    });
}

function setupEventManagement() {
  const form = document.getElementById('addEventForm');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const codeInput = document.getElementById('evtCode');
      const titleInput = document.getElementById('evtTitle');
      const artistInput = document.getElementById('evtArtist');
      const dateInput = document.getElementById('evtDate');
      const timeInput = document.getElementById('evtTime');
      const locationInput = document.getElementById('evtLocation');
      const categoryInput = document.getElementById('evtCategory');
      const bannerInput = document.getElementById('evtBanner');
      const descInput = document.getElementById('evtDescription');

      const priceStandard = parseInt(document.getElementById('priceStandard').value, 10) || 0;
      const priceVIP = parseInt(document.getElementById('priceVIP').value, 10) || 0;
      const priceVVIP = parseInt(document.getElementById('priceVVIP').value, 10) || 0;

      const events = JSON.parse(localStorage.getItem('events')) || [];
      const codeVal = codeInput.value.trim().toUpperCase();
      // prevent duplicate code unless editing the same event
      const editingId = form.getAttribute('data-edit-id');
      const duplicate = events.some(evt => evt.code === codeVal && String(evt.id) !== String(editingId || ''));
      if (duplicate) {
        if (typeof showToast === 'function') {
          showToast('Lỗi: Mã sự kiện đã tồn tại!', 'danger');
        }
        return;
      }
      const newId = events.length > 0 ? Math.max(...events.map(e => e.id)) + 1 : 1;
      const ticketClasses = [
        { name: 'Standard', price: priceStandard, desc: 'Vé Standard vị trí khán đài tự do', available: 100 },
        { name: 'VIP', price: priceVIP, desc: 'Vé VIP gần sân khấu, tặng nước uống', available: 50 },
        { name: 'VVIP', price: priceVVIP, desc: 'Vé VVIP hàng đầu sát sân khấu, buffet nhẹ', available: 20 }
      ];
      const minPriceVal = Math.min(priceStandard, priceVIP, priceVVIP).toLocaleString('vi-VN') + ' VNĐ';

      const newEvent = {
        id: newId,
        code: codeVal,
        title: titleInput.value.trim(),
        artist: artistInput.value.trim(),
        category: categoryInput ? categoryInput.value.trim() : '',
        date: dateInput.value.trim(),
        time: timeInput.value.trim(),
        location: locationInput.value.trim(),
        minPrice: minPriceVal,
        banner: bannerInput.value.trim(),
        description: descInput.value.trim(),
        ticketClasses: ticketClasses
      };
      // detect edit mode
      if (editingId) {
        const idx = events.findIndex(e => e.id === parseInt(editingId, 10));
        if (idx !== -1) {
          newEvent.id = parseInt(editingId, 10);
          events[idx] = newEvent;
        } else {
          events.push(newEvent);
        }
        form.removeAttribute('data-edit-id');
      } else {
        events.push(newEvent);
      }
      localStorage.setItem('events', JSON.stringify(events));

      form.reset();
      const bannerPreview = document.getElementById('evtBannerPreview');
      const bannerFileInput = document.getElementById('evtBannerFile');
      if (bannerPreview) { bannerPreview.src = ''; bannerPreview.style.display = 'none'; }
      if (bannerFileInput) { bannerFileInput.value = ''; }
      // clear hidden date picker value
      const evtDatePickerEl = document.getElementById('evtDatePicker');
      if (evtDatePickerEl) evtDatePickerEl.value = '';
      renderAdminEventsTable();

      // reset form state and buttons
      const eventFormTitle = document.getElementById('eventFormTitle');
      const eventFormSubmitBtn = document.getElementById('eventFormSubmitBtn');
      const cancelEditBtn = document.getElementById('cancelEditBtn');
      if (eventFormTitle) eventFormTitle.textContent = 'Thêm sự kiện mới';
      if (eventFormSubmitBtn) eventFormSubmitBtn.textContent = 'Tạo Sự Kiện';
      if (cancelEditBtn) cancelEditBtn.classList.add('d-none');

      if (typeof showToast === 'function') {
        showToast(`Đã thêm sự kiện "${newEvent.title}" thành công!`, 'success');
      }
    });
  }
  const presetBtns = document.querySelectorAll('.preset-banner-btn');
  presetBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const url = btn.getAttribute('data-url');
      const bannerInput = document.getElementById('evtBanner');
      const bannerPreview = document.getElementById('evtBannerPreview');
      if (bannerInput) {
        bannerInput.value = url;
      }
      if (bannerPreview) {
        bannerPreview.src = url;
        bannerPreview.style.display = 'inline-block';
      }
      const bannerFileInput = document.getElementById('evtBannerFile');
      if (bannerFileInput) bannerFileInput.value = '';
    });
  });

  const bannerFileInputEl = document.getElementById('evtBannerFile');
  const bannerPreviewEl = document.getElementById('evtBannerPreview');
  if (bannerFileInputEl) {
    bannerFileInputEl.addEventListener('change', async () => {
      const file = bannerFileInputEl.files && bannerFileInputEl.files[0];
      if (!file) return;

      const bannerInput = document.getElementById('evtBanner');
      const objectUrl = URL.createObjectURL(file);
      if (bannerPreviewEl) {
        bannerPreviewEl.src = objectUrl;
        bannerPreviewEl.style.display = 'inline-block';
      }

      let bannerPath = null;
      if (window.showDirectoryPicker) {
        bannerPath = await saveFileToImageFolder(file);
        if (!bannerPath) {
          showToast('Không thể lưu ảnh vào thư mục: sử dụng fallback localStorage.', 'warning');
        }
      }

      if (!bannerPath) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const dataUrl = e.target.result;
          const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
          bannerPath = `image/events/${Date.now()}_${safeName}`;
          try {
            const imgs = JSON.parse(localStorage.getItem('storedImages') || '{}');
            imgs[bannerPath] = dataUrl;
            localStorage.setItem('storedImages', JSON.stringify(imgs));
          } catch (err) {
            console.error('Could not store image mapping', err);
          }
          if (bannerInput) bannerInput.value = bannerPath;
        };
        reader.readAsDataURL(file);
      } else {
        if (bannerInput) bannerInput.value = bannerPath;
      }
    });
  }

  // Sync manual date input with hidden date picker and open native picker via button
  const evtDateBtn = document.getElementById('evtDateBtn');
  const evtDatePicker = document.getElementById('evtDatePicker');
  const evtDateInput = document.getElementById('evtDate');
  function ddmmyyyyToYyyymmdd(s) {
    const m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (!m) return null;
    const d = m[1].padStart(2, '0');
    const mo = m[2].padStart(2, '0');
    const y = m[3];
    return `${y}-${mo}-${d}`;
  }
  function yyyyMMddToDDMMYYYY(s) {
    if (!s) return '';
    const parts = s.split('-');
    if (parts.length !== 3) return '';
    const y = parts[0], mo = parts[1], d = parts[2];
    return `${d.padStart(2,'0')}/${mo.padStart(2,'0')}/${y}`;
  }
  if (evtDateBtn && evtDatePicker) {
    evtDateBtn.addEventListener('click', () => {
      const useShowPicker = typeof evtDatePicker.showPicker === 'function';
      if (useShowPicker) {
        evtDatePicker.showPicker();
        return;
      }

      const rect = evtDateBtn.getBoundingClientRect();
      evtDatePicker.style.position = 'absolute';
      evtDatePicker.style.left = `${rect.left}px`;
      evtDatePicker.style.top = `${rect.top}px`;
      evtDatePicker.style.width = `${Math.max(rect.width, 1)}px`;
      evtDatePicker.style.height = `${Math.max(rect.height, 1)}px`;
      evtDatePicker.style.opacity = '0';
      evtDatePicker.style.pointerEvents = 'auto';
      evtDatePicker.style.zIndex = '9999';
      document.body.appendChild(evtDatePicker);
      evtDatePicker.focus();
      evtDatePicker.click();

      setTimeout(() => {
        evtDatePicker.style.pointerEvents = 'none';
        evtDatePicker.style.zIndex = '';
        evtDatePicker.style.left = '0';
        evtDatePicker.style.top = '0';
        evtDatePicker.style.width = '1px';
        evtDatePicker.style.height = '1px';
      }, 300);
    });
    evtDatePicker.addEventListener('change', () => {
      if (evtDateInput) evtDateInput.value = yyyyMMddToDDMMYYYY(evtDatePicker.value);
    });
  }
  if (evtDateInput && evtDatePicker) {
    evtDateInput.addEventListener('blur', () => {
      const v = evtDateInput.value.trim();
      const conv = ddmmyyyyToYyyymmdd(v);
      if (conv) evtDatePicker.value = conv;
    });
  }
}
window.adminDeleteEvent = function(eventId) {
  if (!confirm('Bạn có chắc chắn muốn xóa sự kiện này không?')) return;

  const events = JSON.parse(localStorage.getItem('events')) || [];
  const eventIndex = events.findIndex(e => e.id === eventId);
  if (eventIndex === -1) return;

  const deletedTitle = events[eventIndex].title;
  // remove stored image mapping if present
  try {
    const evtBanner = events[eventIndex].banner;
    if (evtBanner && evtBanner.startsWith('image/')) {
      const imgs = JSON.parse(localStorage.getItem('storedImages') || '{}');
      if (imgs[evtBanner]) {
        delete imgs[evtBanner];
        localStorage.setItem('storedImages', JSON.stringify(imgs));
      }
    }
  } catch (e) {
    // ignore
  }

  events.splice(eventIndex, 1);
  localStorage.setItem('events', JSON.stringify(events));

  renderAdminEventsTable();

  if (typeof showToast === 'function') {
    showToast(`Đã xóa sự kiện "${deletedTitle}" thành công!`, 'success');
  }
};

window.adminEditEvent = function(eventId) {
  const events = JSON.parse(localStorage.getItem('events')) || [];
  const evt = events.find(e => e.id === eventId);
  if (!evt) return;

  const form = document.getElementById('addEventForm');
  if (!form) return;

  // populate fields
  document.getElementById('evtCode').value = evt.code || '';
  document.getElementById('evtTitle').value = evt.title || '';
  document.getElementById('evtArtist').value = evt.artist || '';
  document.getElementById('evtDate').value = evt.date || '';
  document.getElementById('evtTime').value = evt.time || '';
  document.getElementById('evtLocation').value = evt.location || '';
  document.getElementById('evtCategory').value = evt.category || '';
  document.getElementById('evtDescription').value = evt.description || '';

  // ticket classes
  const standard = evt.ticketClasses && evt.ticketClasses[0] ? evt.ticketClasses[0].price : 0;
  const vip = evt.ticketClasses && evt.ticketClasses[1] ? evt.ticketClasses[1].price : 0;
  const vvip = evt.ticketClasses && evt.ticketClasses[2] ? evt.ticketClasses[2].price : 0;
  document.getElementById('priceStandard').value = standard;
  document.getElementById('priceVIP').value = vip;
  document.getElementById('priceVVIP').value = vvip;

  // banner
  const bannerInput = document.getElementById('evtBanner');
  const bannerPreview = document.getElementById('evtBannerPreview');
  if (bannerInput) bannerInput.value = evt.banner || '';
  if (bannerPreview) {
    try {
      const imgs = JSON.parse(localStorage.getItem('storedImages') || '{}');
      if (evt.banner && evt.banner.startsWith('image/') && imgs[evt.banner]) {
        bannerPreview.src = imgs[evt.banner];
        bannerPreview.style.display = 'inline-block';
      } else if (evt.banner) {
        bannerPreview.src = evt.banner;
        bannerPreview.style.display = 'inline-block';
      } else {
        bannerPreview.src = '';
        bannerPreview.style.display = 'none';
      }
    } catch (e) {
      bannerPreview.src = evt.banner || '';
      bannerPreview.style.display = evt.banner ? 'inline-block' : 'none';
    }
  }

  // set edit mode
  form.setAttribute('data-edit-id', String(evt.id));
  const eventFormTitle = document.getElementById('eventFormTitle');
  const eventFormSubmitBtn = document.getElementById('eventFormSubmitBtn');
  const cancelEditBtn = document.getElementById('cancelEditBtn');
  if (eventFormTitle) eventFormTitle.textContent = `Sửa sự kiện: ${evt.title}`;
  if (eventFormSubmitBtn) eventFormSubmitBtn.textContent = 'Lưu thay đổi';
  if (cancelEditBtn) cancelEditBtn.classList.remove('d-none');
  // scroll to form
  eventFormTitle.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

// handle cancel edit
document.addEventListener('DOMContentLoaded', () => {
  const cancelEditBtn = document.getElementById('cancelEditBtn');
  if (cancelEditBtn) {
    cancelEditBtn.addEventListener('click', () => {
      const form = document.getElementById('addEventForm');
      if (!form) return;
      form.removeAttribute('data-edit-id');
      form.reset();
      const bannerPreview = document.getElementById('evtBannerPreview');
      if (bannerPreview) { bannerPreview.src = ''; bannerPreview.style.display = 'none'; }
      const eventFormTitle = document.getElementById('eventFormTitle');
      const eventFormSubmitBtn = document.getElementById('eventFormSubmitBtn');
      if (eventFormTitle) eventFormTitle.textContent = 'Thêm sự kiện mới';
      if (eventFormSubmitBtn) eventFormSubmitBtn.textContent = 'Tạo Sự Kiện';
      cancelEditBtn.classList.add('d-none');
    });
  }
});
>>>>>>> 1c01d02ad7d9ca3a16c2fb278ce0f67359053204
