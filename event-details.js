$(document).ready(() => {
  const events = JSON.parse(localStorage.getItem('events'));
  
  const $container = $('#event-container');
  if ($container.length === 0) return;
  const params = new URLSearchParams(window.location.search);
  const idStr = params.get('id');
  if (!idStr) {
    showEventNotFound($container);
    return;
  }
  let event = null;
  if (!isNaN(idStr)) {
    const id = parseInt(idStr, 10);
    event = events.find(e => e.id === id);
  } else {
    event = events.find(e => e.code === idStr.toUpperCase());
  }
  if (!event) {
    showEventNotFound($container);
    return;
  }
  renderEventDetails($container, event);
});

function showEventNotFound($container) {
  $container.html(`
    <div class="text-center py-5">
      <h2 class="text-danger mb-3">Sự kiện không tồn tại</h2>
      <p class="text-muted mb-4">Không tìm thấy thông tin sự kiện được yêu cầu. Vui lòng kiểm tra lại đường dẫn.</p>
      <a href="index.html" class="btn btn-primary">Quay lại trang chủ</a>
    </div>
  `);
}

function getDefaultCategory(event) {
  if (event.category && event.category.trim()) return event.category;
  if (event.id === 1 || event.code === 'EVT001') return 'Pop';
  if (event.id === 2 || event.code === 'EVT002') return 'Acoustic';
  if (event.id === 3 || event.code === 'EVT003') return 'EDM/Hiphop';
  return 'Khác';
}

function renderEventDetails($container, event) {
  const eventCategory = getDefaultCategory(event);
  document.title = `${event.title} - Chi tiết sự kiện | QRBOX`;
  let badgeClass = 'bg-primary';
  if (event.code === 'EVT002') badgeClass = 'bg-success';
  if (event.code === 'EVT003') badgeClass = 'bg-warning text-dark';

  let ticketClassesHtml = '';
  event.ticketClasses.forEach(tClass => {
    let tClassLower = tClass.name.toLowerCase();
    
    let classCardMod = tClassLower === 'vip' ? 'vip' : (tClassLower === 'vvip' ? 'vvip' : '');
    
    ticketClassesHtml += `
      <div class="ticket-option-card ${classCardMod}">
        <h4 class="ticket-option-title">${tClass.name}</h4>
        <div class="ticket-option-price">${formatCurrency(tClass.price)}</div>
        <p class="ticket-option-desc">${tClass.desc}</p>
        <div class="ticket-option-avail">
          Số lượng còn lại: <span class="text-info">${tClass.available} vé</span>
        </div>
        <a href="payment-page.html?id=${event.code}&class=${encodeURIComponent(tClass.name)}" class="btn btn-primary btn-sm w-100 mt-2">
          Chọn hạng vé này
        </a>
      </div>
    `;
  });
  let imgs = {};
  try {
    imgs = JSON.parse(localStorage.getItem('storedImages') || '{}');
  } catch (e) {}

  function resolveBannerSrc(banner) {
    if (banner && banner.startsWith('image/') && imgs[banner]) return imgs[banner];
    return banner;
  }

  $container.html(`
    <div class="event-detail-hero">
      <img src="${resolveBannerSrc(event.banner)}" alt="${event.title}" class="event-detail-banner">
      <div class="event-detail-overlay">
        <div class="event-detail-header">
          <span class="event-badge ${badgeClass} mb-3 d-inline-block">
            ${event.code}
          </span>
          <h1>${event.title}</h1>
          
          <div class="event-detail-meta">
            <div class="meta-item">
              🎤 <strong>Ca sĩ:</strong> ${event.artist}
            </div>
            <div class="meta-item">
              📅 <strong>Thời gian:</strong> ${event.date} - ${event.time}
            </div>
            <div class="meta-item">
              📍 <strong>Địa điểm:</strong> ${event.location}
            </div>
            <div class="meta-item">
              🎫 <strong>Thể loại:</strong> ${eventCategory}
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="row g-4 mt-2">
      <div class="col-12 col-lg-8">
        <div class="detail-card h-100">
          <h3>Giới thiệu sự kiện</h3>
          <p class="lead" style="line-height: 1.8; color: var(--text-main);">
            ${event.description}
          </p>
          
          <h3 class="mt-5">Thông tin quan trọng</h3>
          <ul class="text-muted" style="line-height: 1.8;">
            <li>Cổng soát vé sẽ bắt đầu đón khách trước giờ biểu diễn 60 phút.</li>
            <li>Vui lòng chuẩn bị sẵn mã QR trên ứng dụng hoặc bản in để nhân viên quét xác thực tại lối vào cổng.</li>
            <li>Hành lý cồng kềnh, các chất kích thích và vật dụng nguy hiểm bị cấm mang vào khu vực biểu diễn.</li>
            <li>Vé đã mua không được hoàn trả, nhưng có thể chuyển nhượng thông tin QR code cho người khác.</li>
          </ul>

          <div class="mt-5 p-4 border border-secondary rounded bg-opacity-10 bg-secondary d-flex flex-wrap align-items-center justify-content-between gap-3">
            <div>
              <h5 class="mb-1 text-white">Bạn cần hỗ trợ đặt vé doanh nghiệp hoặc mua số lượng lớn?</h5>
              <p class="mb-0 text-muted text-sm">Vui lòng liên hệ với ban tổ chức qua hotline: 0123 456 789</p>
            </div>
            <a href="mailto:support@liveshowticket.vn" class="btn btn-outline-primary">Liên hệ BTC</a>
          </div>
        </div>
      </div>

      <div class="col-12 col-lg-4">
        <div class="detail-card h-100">
          <h3>Đặt vé nhanh</h3>
          <p class="text-muted text-sm mb-4">Chọn một trong các hạng vé dưới đây để tiến hành điền thông tin và thanh toán vé trực tuyến.</p>
          
          <div class="ticket-options-container">
            ${ticketClassesHtml}
          </div>
        </div>
      </div>
    </div>
  `);
}

function formatCurrency(amount) {
  return amount.toLocaleString('vi-VN') + ' VNĐ';
}
