document.addEventListener('DOMContentLoaded', () => {
    initEventDetailsPage();
});

function initEventDetailsPage() {
    const container = document.getElementById('event-container');

    if (!container) return;

    const events = {
        1: {
            id: 'EVT001',
            detailId: '1',
            title: 'Liveshow Mùa Hè 2026',
            singer: 'Đang cập nhật',
            date: '20/06/2026 - 19:30',
            location: 'Sân vận động trung tâm',
            description: 'Chương trình liveshow âm nhạc mùa hè với nhiều tiết mục đặc sắc, sân khấu ngoài trời và hệ thống âm thanh ánh sáng hiện đại.',
            standardPrice: '300.000 VNĐ',
            vipPrice: '700.000 VNĐ',
            vvipPrice: '1.500.000 VNĐ',
            remainingTickets: 500,
            paymentId: 'EVT001'
        },

        2: {
            id: 'EVT002',
            detailId: '2',
            title: 'Đêm nhạc Acoustic',
            singer: 'Đang cập nhật',
            date: '15/07/2026 - 20:00',
            location: 'Nhà hát thành phố',
            description: 'Đêm nhạc acoustic nhẹ nhàng, gần gũi, phù hợp với khán giả yêu thích không gian âm nhạc ấm cúng.',
            standardPrice: '250.000 VNĐ',
            vipPrice: '600.000 VNĐ',
            vvipPrice: '1.200.000 VNĐ',
            remainingTickets: 300,
            paymentId: 'EVT002'
        },

        3: {
            id: 'EVT003',
            detailId: '3',
            title: 'Music Night 2026',
            singer: 'Đang cập nhật',
            date: '10/08/2026 - 19:00',
            location: 'Nhà thi đấu thành phố',
            description: 'Sự kiện âm nhạc buổi tối với sân khấu lớn, nhiều tiết mục biểu diễn và không gian giải trí sôi động.',
            standardPrice: '400.000 VNĐ',
            vipPrice: '800.000 VNĐ',
            vvipPrice: '1.600.000 VNĐ',
            remainingTickets: 800,
            paymentId: 'EVT003'
        }
    };

    const params = new URLSearchParams(window.location.search);
    const eventId = params.get('id');

    if (!eventId) {
        renderNotFound(container, 'Thiếu ID sự kiện trên URL.');
        return;
    }

    const event = Object.values(events).find(item =>
        item.detailId === eventId || item.id === eventId
    );

    if (!event) {
        renderNotFound(container, 'ID sự kiện không hợp lệ hoặc sự kiện chưa được khai báo.');
        return;
    }

    renderEventDetail(container, event);
}

function renderEventDetail(container, event) {
    document.title = `${event.title} | QRBOX`;

    container.innerHTML = `
        <article class="event-detail-card">

            <div class="event-detail-header">
                <span class="event-badge bg-primary">
                    ${event.id}
                </span>

                <h1>${event.title}</h1>

                <p>${event.description}</p>
            </div>

            <div class="event-detail-grid">

                <section class="event-detail-info">
                    <h2>Thông tin sự kiện</h2>

                    <ul class="event-detail-list">
                        <li>
                            <strong>Ca sĩ:</strong>
                            <span>${event.singer}</span>
                        </li>

                        <li>
                            <strong>Thời gian:</strong>
                            <span>${event.date}</span>
                        </li>

                        <li>
                            <strong>Địa điểm:</strong>
                            <span>${event.location}</span>
                        </li>

                        <li>
                            <strong>Số lượng vé còn:</strong>
                            <span>${event.remainingTickets} vé</span>
                        </li>
                    </ul>
                </section>

                <section class="event-detail-price">
                    <h2>Bảng giá vé</h2>

                    <div class="table-responsive">
                        <table class="ticket-price-table">
                            <thead>
                                <tr>
                                    <th>Loại vé</th>
                                    <th>Giá vé</th>
                                    <th>Mô tả</th>
                                </tr>
                            </thead>

                            <tbody>
                                <tr>
                                    <td>Vé thường</td>
                                    <td>${event.standardPrice}</td>
                                    <td>Khu vực ghế thường</td>
                                </tr>

                                <tr>
                                    <td>Vé VIP</td>
                                    <td>${event.vipPrice}</td>
                                    <td>Khu vực gần sân khấu hơn</td>
                                </tr>

                                <tr>
                                    <td>Vé VVIP</td>
                                    <td>${event.vvipPrice}</td>
                                    <td>Khu vực ưu tiên, vị trí đẹp</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </section>

            </div>

            <div class="event-detail-actions">
                <a href="payment-page.html?id=${event.paymentId}" class="btn btn-primary">
                    Mua vé / Thanh toán
                </a>

                <a href="index.html#events" class="btn btn-outline-primary">
                    Quay lại danh sách sự kiện
                </a>
            </div>

        </article>
    `;
}

function renderNotFound(container, message) {
    document.title = 'Không tìm thấy sự kiện | QRBOX';

    container.innerHTML = `
        <section class="event-detail-card">
            <div class="event-detail-header">
                <span class="section-badge">ERROR</span>

                <h1>Không tìm thấy sự kiện</h1>

                <p>${message}</p>
            </div>

            <div class="event-detail-actions">
                <a href="index.html#events" class="btn btn-primary">
                    Quay lại danh sách sự kiện
                </a>
            </div>
        </section>
    `;
}