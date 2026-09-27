import { EarlyWarningStudent, ClassSession } from '../types/attendance';

export class DocxExportService {
  /**
   * Generates and downloads an official Vietnamese administrative decision in Word format (.doc/.docx XML)
   * for students exceeding the 20% absence threshold (EWS Critical).
   */
  static exportEwsDisciplinaryNotice(students: EarlyWarningStudent[], session?: ClassSession): void {
    const criticalStudents = students.filter(s => s.riskLevel === 'critical');
    const currentDate = new Date();
    const day = String(currentDate.getDate()).padStart(2, '0');
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const year = currentDate.getFullYear();

    const courseName = session?.courseName || criticalStudents[0]?.courseName || 'Học Phần Chuyên Ngành';
    const courseCode = session?.courseCode || criticalStudents[0]?.courseCode || 'HP-EWS';
    const teacherName = session?.teacherName || 'TS. Nguyễn Thanh Sơn';

    const tableRows = criticalStudents.map((item, index) => `
      <tr style="height: 28px;">
        <td style="border: 1px solid #000; text-align: center; padding: 6px; font-size: 13px;">${index + 1}</td>
        <td style="border: 1px solid #000; text-align: center; padding: 6px; font-size: 13px; font-weight: bold;">${item.student.studentCode}</td>
        <td style="border: 1px solid #000; padding: 6px; font-size: 13px;">${item.student.fullName}</td>
        <td style="border: 1px solid #000; text-align: center; padding: 6px; font-size: 13px;">${item.student.className}</td>
        <td style="border: 1px solid #000; text-align: center; padding: 6px; font-size: 13px;">${item.absentSessions}/${item.totalCourseSessions} buổi</td>
        <td style="border: 1px solid #000; text-align: center; padding: 6px; font-size: 13px; font-weight: bold; color: #b91c1c;">${item.absenceRate}%</td>
        <td style="border: 1px solid #000; text-align: center; padding: 6px; font-size: 13px; font-weight: bold; color: #b91c1c;">ĐÌNH CHỈ THI</td>
        <td style="border: 1px solid #000; padding: 6px; font-size: 12px;">Vượt ngưỡng 20% quy chế ĐT</td>
      </tr>
    `).join('');

    const docContent = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset="utf-8">
        <title>Biên Bản Cảnh Báo Sớm EWS</title>
        <style>
          @page {
            size: A4;
            margin: 20mm 15mm 20mm 20mm;
          }
          body {
            font-family: 'Times New Roman', Times, serif;
            font-size: 14pt;
            line-height: 1.4;
            color: #000000;
          }
          table {
            border-collapse: collapse;
            width: 100%;
          }
          .header-table td {
            vertical-align: top;
            padding: 2px 4px;
          }
          .title {
            text-align: center;
            font-weight: bold;
            font-size: 16pt;
            margin-top: 25px;
            margin-bottom: 5px;
            text-transform: uppercase;
          }
          .subtitle {
            text-align: center;
            font-style: italic;
            font-size: 13pt;
            margin-bottom: 20px;
          }
          .content-p {
            text-indent: 10mm;
            margin-bottom: 8px;
            text-align: justify;
          }
          .sign-table {
            margin-top: 35px;
            page-break-inside: avoid;
          }
          .sign-title {
            font-weight: bold;
            text-transform: uppercase;
            text-align: center;
          }
          .sign-note {
            font-style: italic;
            font-size: 11pt;
            text-align: center;
          }
        </style>
      </head>
      <body>
        <!-- Header National standard -->
        <table class="header-table" style="width: 100%;">
          <tr>
            <td style="width: 45%; text-align: center;">
              <strong>BỘ GIÁO DỤC VÀ ĐÀO TẠO</strong><br>
              <strong>TRƯỜNG ĐẠI HỌC CÔNG NGHỆ</strong><br>
              <span style="font-size: 12pt;">Số: ${day}${month}/BB-ĐTKH</span>
            </td>
            <td style="width: 55%; text-align: center;">
              <strong>CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</strong><br>
              <strong>Độc lập - Tự do - Hạnh phúc</strong><br>
              <span style="font-size: 13pt;">-----------------------</span><br>
              <span style="font-style: italic; font-size: 12pt;">Hà Nội, ngày ${day} tháng ${month} năm ${year}</span>
            </td>
          </tr>
        </table>

        <!-- Document Title -->
        <div class="title">BIÊN BẢN KIỂM TOÁN CHUYÊN CẦN & ĐỀ XUẤT ĐÌNH CHỈ THI</div>
        <div class="subtitle">(Căn cứ ngưỡng Cảnh báo sớm EWS 20% thời lượng học phần)</div>

        <!-- Legal References -->
        <p class="content-p">
          - Căn cứ Quyết định số 08/2021/TT-BGDĐT ngày 18/03/2021 của Bộ trưởng Bộ Giáo dục và Đào tạo ban hành Quy chế đào tạo trình độ đại học;
        </p>
        <p class="content-p">
          - Căn cứ dữ liệu trích xuất từ <strong>Hệ thống Quản lý Điểm danh Đa tầng (Smart Attendance Expert)</strong> tích hợp Geofencing, Dynamic QR và Audit Log;
        </p>
        <p class="content-p">
          Hôm nay, vào lúc ${currentDate.toLocaleTimeString('vi-VN')}, Phòng Đào tạo phối hợp cùng Giảng viên phụ trách học phần tiến hành rà soát chuyên cần học phần <strong>${courseName}</strong> (Mã học phần: <strong>${courseCode}</strong>).
        </p>
        
        <p class="content-p">
          <strong>KẾT QUẢ ĐỐI SOÁT & DANH SÁCH SINH VIÊN VI PHẠM:</strong>
        </p>

        <!-- Violation Table -->
        <table style="width: 100%; margin-top: 10px; margin-bottom: 20px;">
          <thead>
            <tr style="background-color: #f1f5f9; height: 32px;">
              <th style="border: 1px solid #000; text-align: center; width: 35px; font-size: 12pt;">STT</th>
              <th style="border: 1px solid #000; text-align: center; width: 85px; font-size: 12pt;">Mã SV</th>
              <th style="border: 1px solid #000; text-align: center; font-size: 12pt;">Họ và Tên</th>
              <th style="border: 1px solid #000; text-align: center; width: 85px; font-size: 12pt;">Lớp</th>
              <th style="border: 1px solid #000; text-align: center; width: 75px; font-size: 12pt;">Số Buổi Vắng</th>
              <th style="border: 1px solid #000; text-align: center; width: 70px; font-size: 12pt;">Tỷ Lệ</th>
              <th style="border: 1px solid #000; text-align: center; width: 95px; font-size: 12pt;">Đề Xuất</th>
              <th style="border: 1px solid #000; text-align: center; width: 110px; font-size: 12pt;">Ghi Chú</th>
            </tr>
          </thead>
          <tbody>
            ${tableRows || '<tr><td colspan="8" style="text-align: center; padding: 12px; border: 1px solid #000;">Không có sinh viên nào vượt ngưỡng rủi ro 20%.</td></tr>'}
          </tbody>
        </table>

        <p class="content-p">
          <strong>QUYẾT NGHỊ HỘI ĐỒNG:</strong>
        </p>
        <p class="content-p">
          1. Đề nghị Ban Giám hiệu và Trưởng Khoa ký Quyết định cấm thi kết thúc học phần đối với các sinh viên có tỷ lệ vắng từ 20% trở lên theo danh sách nêu trên.
        </p>
        <p class="content-p">
          2. Giao Cố vấn học tập và Bộ phận Quản trị phát thông báo tự động (SMS & Email) khẩn cấp tới phụ huynh sinh viên để gia đình nắm rõ tình hình.
        </p>
        <p class="content-p">
          Biên bản được lập thành 03 bản có giá trị pháp lý như nhau, lưu tại Phòng Đào tạo, Văn phòng Khoa và lưu vết mã hóa trên hệ thống Audit Log điện tử.
        </p>

        <!-- Signatures -->
        <table class="sign-table" style="width: 100%;">
          <tr>
            <td style="width: 50%; text-align: center;">
              <div class="sign-title">GIẢNG VIÊN GIẢNG DẠY</div>
              <div class="sign-note">(Ký và ghi rõ họ tên)</div>
              <br><br><br><br>
              <strong>${teacherName}</strong>
            </td>
            <td style="width: 50%; text-align: center;">
              <div class="sign-title">TRƯỞNG PHÒNG ĐÀO TẠO</div>
              <div class="sign-note">(Ký và đóng dấu)</div>
              <br><br><br><br>
              <strong>TS. Nguyễn Hoàng Nam</strong>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    const blob = new Blob(['\ufeff', docContent], {
      type: 'application/msword'
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Bien_Ban_Dinh_Chi_Thi_EWS_${courseCode}_${year}${month}${day}.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  /**
   * Generates and downloads an official Letter to Parents for a specific student.
   */
  static exportParentSummonsLetter(studentData: EarlyWarningStudent): void {
    const currentDate = new Date();
    const day = String(currentDate.getDate()).padStart(2, '0');
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const year = currentDate.getFullYear();

    const docContent = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset="utf-8">
        <title>Giấy Báo Tình Hình Chuyên Cần</title>
        <style>
          body { font-family: 'Times New Roman', serif; font-size: 14pt; line-height: 1.5; }
          .title { text-align: center; font-weight: bold; font-size: 16pt; margin: 20px 0 5px; text-transform: uppercase; }
          .p { text-indent: 10mm; text-align: justify; margin-bottom: 8px; }
        </style>
      </head>
      <body>
        <table style="width: 100%;">
          <tr>
            <td style="width: 50%; text-align: center;">
              <strong>TRƯỜNG ĐẠI HỌC CÔNG NGHỆ</strong><br>
              <strong>PHÒNG CÔNG TÁC SINH VIÊN</strong>
            </td>
            <td style="width: 50%; text-align: center;">
              <strong>CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</strong><br>
              <strong>Độc lập - Tự do - Hạnh phúc</strong><br>
              <span style="font-size: 12pt; font-style: italic;">Hà Nội, ngày ${day} tháng ${month} năm ${year}</span>
            </td>
          </tr>
        </table>

        <div class="title">GIẤY BÁO TÌNH HÌNH CHUYÊN CẦN SINH VIÊN</div>
        <div style="text-align: center; font-style: italic; margin-bottom: 20px;">
          (Về việc sinh viên chạm ngưỡng cảnh báo học vụ 20% vắng mặt)
        </div>

        <p class="p"><strong>Kính gửi:</strong> Quý Phụ huynh em: <strong>${studentData.student.fullName}</strong></p>
        <p class="p">Nhà trường xin trân trọng thông báo tình hình học tập và điểm danh của sinh viên như sau:</p>
        
        <table style="width: 100%; border: 1px solid #000; border-collapse: collapse; margin: 15px 0;">
          <tr>
            <td style="border: 1px solid #000; padding: 6px; font-weight: bold; width: 35%;">Mã Sinh Viên:</td>
            <td style="border: 1px solid #000; padding: 6px;">${studentData.student.studentCode}</td>
          </tr>
          <tr>
            <td style="border: 1px solid #000; padding: 6px; font-weight: bold;">Lớp Quản Lý:</td>
            <td style="border: 1px solid #000; padding: 6px;">${studentData.student.className}</td>
          </tr>
          <tr>
            <td style="border: 1px solid #000; padding: 6px; font-weight: bold;">Học Phần Đang Học:</td>
            <td style="border: 1px solid #000; padding: 6px;">${studentData.courseName} (${studentData.courseCode})</td>
          </tr>
          <tr>
            <td style="border: 1px solid #000; padding: 6px; font-weight: bold;">Số Buổi Đã Vắng:</td>
            <td style="border: 1px solid #000; padding: 6px; color: #b91c1c; font-weight: bold;">${studentData.absentSessions}/${studentData.totalCourseSessions} buổi (Tỷ lệ vắng: ${studentData.absenceRate}%)</td>
          </tr>
          <tr>
            <td style="border: 1px solid #000; padding: 6px; font-weight: bold;">Nguy Cơ Học Vụ:</td>
            <td style="border: 1px solid #000; padding: 6px; color: #b91c1c; font-weight: bold;">${studentData.riskLevel === 'critical' ? 'BỊ ĐÌNH CHỈ THI HỌC PHẦN' : 'CẢNH BÁO MỨC ĐỘ CAO'}</td>
          </tr>
        </table>

        <p class="p">
          Theo Điều 12 Quy chế Đào tạo trình độ đại học của Bộ GD&ĐT, sinh viên nghỉ học quá 20% tổng thời lượng môn học sẽ <strong>không đủ điều kiện dự thi kết thúc học phần</strong> và phải đăng ký học lại.
        </p>
        <p class="p">
          Kính đề nghị Quý gia đình đôn đốc, nhắc nhở em và liên hệ với Cố vấn học tập trước 16h30 ngày 30/${month}/${year} để giải quyết các vướng mắc nếu có.
        </p>

        <table style="width: 100%; margin-top: 35px;">
          <tr>
            <td style="width: 50%;"></td>
            <td style="width: 50%; text-align: center;">
              <strong>TRƯỞNG PHÒNG ĐÀO TẠO</strong><br>
              <em>(Đã ký)</em><br><br><br>
              <strong>TS. Nguyễn Hoàng Nam</strong>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    const blob = new Blob(['\ufeff', docContent], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Thu_Bao_Phu_Huynh_${studentData.student.studentCode}.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}
