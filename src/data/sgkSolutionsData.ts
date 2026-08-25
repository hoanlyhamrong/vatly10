export interface SgkQuestionItem {
  id: string;
  type: 'IN_TEXT_QUESTION' | 'ACTIVITY' | 'EXERCISE' | 'EM_CO_THE' | 'DISCUSSION';
  title: string;
  page: number;
  section: string;
  prompt: string;
  summary?: string;
  frameOfReference?: string;
  formula?: string;
  stepByStepSolution: string[];
  finalAnswer: string;
  pedagogicalNote?: string;
  targetCompetencyGroup?: 'Nhóm A' | 'Nhóm B' | 'Nhóm C' | 'Nhóm D';
  errorWarning?: string;
  interactiveKey?: 'EXP_10_2' | 'WALL_CHECK' | 'EKE_FLOOR' | string;
}

export interface SgkLessonSolutions {
  lessonId: number;
  chapterId: number;
  lessonNumber: number;
  lessonTitle: string;
  pageRange: string;
  totalQuestions: number;
  questions: SgkQuestionItem[];
}

export interface SgkChapterSolutions {
  chapterId: number;
  romanNumeral: string;
  chapterTitle: string;
  lessons: SgkLessonSolutions[];
}

export const SGK_SOLUTIONS_DATA: SgkChapterSolutions[] = [
  {
    chapterId: 1,
    romanNumeral: 'I',
    chapterTitle: 'MỞ ĐẦU',
    lessons: [
      {
        lessonId: 1,
        chapterId: 1,
        lessonNumber: 1,
        lessonTitle: 'Làm quen với Vật lí',
        pageRange: 'Trang 7 - 11',
        totalQuestions: 6,
        questions: [
          {
            id: 'b1_q1_p7',
            type: 'IN_TEXT_QUESTION',
            title: 'Câu hỏi mục I (Trang 7)',
            page: 7,
            section: 'I. Đối tượng nghiên cứu của Vật lí và mục tiêu môn Vật lí',
            prompt: '1. Hãy kể tên các lĩnh vực vật lí mà em đã được học ở cấp Trung học cơ sở.\n2. Em thích nhất lĩnh vực nào của Vật lí? Tại sao?',
            summary: 'Kể tên các phân môn Vật lí đã học ở THCS và nêu sở thích, lí do cá nhân.',
            stepByStepSolution: [
              '**Ý 1:** Các lĩnh vực Vật lí đã học ở cấp THCS (trong môn KHTN) bao gồm: Cơ học (chuyển động, lực, áp suất, công, công suất), Nhiệt học (sự truyền nhiệt, nhiệt lượng, các hình thức trao đổi nhiệt), Điện học (đoạn mạch nối tiếp, song song, định luật Ôm), Điện từ học (từ trường, cảm ứng điện từ), Quang học (sự truyền thẳng của ánh sáng, phản xạ, khúc xạ, thấu kính), Âm học (nguồn âm, độ cao, độ to của âm).',
              '**Ý 2:** Học sinh tự liên hệ theo sở thích cá nhân. Ví dụ: Em thích nhất lĩnh vực "Cơ học" hoặc "Điện từ học" vì nó giải thích trực tiếp nguyên lí vận hành của các loại máy bay, tàu hỏa cao tốc đệm từ (Maglev) và thiết bị thông minh quanh ta.'
            ],
            finalAnswer: 'Liệt kê đủ 6 phân môn cơ bản đã học ở THCS và nêu lí do gắn liền thực tế khoa học.',
            pedagogicalNote: 'Giáo viên hướng dẫn học sinh nhận biết tính liên thông từ KHTN THCS lên chương trình Vật lí 10 chuyên sâu.',
            targetCompetencyGroup: 'Nhóm A',
            errorWarning: 'Tránh trả lời sơ sài hoặc nhầm lẫn với các phân môn Sinh học, Hóa học.'
          },
          {
            id: 'b1_q2_p8',
            type: 'IN_TEXT_QUESTION',
            title: 'Câu hỏi mục III.a (Trang 8)',
            page: 8,
            section: 'III. Vai trò của Vật lí đối với khoa học, kĩ thuật và công nghệ',
            prompt: '1. Cơ chế của các phản ứng hoá học được giải thích dựa trên kiến thức thuộc lĩnh vực nào của Vật lí?\n2. Kiến thức về từ trường Trái Đất được dùng để giải thích đặc điểm nào của loài chim di trú?\n3. Sự tương tác giữa các thiên thể được giải thích dựa vào định luật vật lí nào của Newton?\n4. Hãy nêu thêm ví dụ về việc dùng kiến thức vật lí để giải thích hiện tượng tự nhiên mà các em đã học.',
            stepByStepSolution: [
              '**Ý 1:** Cơ chế các phản ứng hoá học (sự bẻ gãy và hình thành liên kết, tương tác giữa các electron lớp vỏ) được giải thích dựa trên **Vật lí nguyên tử, Vật lí lượng tử và Nhiệt động lực học** (Hóa lí, Hóa học lượng tử).',
              '**Ý 2:** Kiến thức về **từ trường Trái Đất** giải thích khả năng định hướng bay tuyệt vời của **loài chim di cư** (nhờ các phân tử protein Cryptochrome nhạy cảm từ trường trong mắt chim).',
              '**Ý 3:** Tương tác chuyển động và lực hút giữa các hành tinh, Mặt Trời, Mặt Trăng được giải thích bằng **Định luật vạn vật hấp dẫn của Isaac Newton**: $F_{hd} = G \\frac{m_1 m_2}{r^2}$.',
              '**Ý 4:** Ví dụ thêm: Dùng hiện tượng tán sắc ánh sáng và phản xạ toàn phần của tia sáng qua giọt nước mưa để giải thích **Cầu vồng sau mưa**; Dùng định luật Ac-si-met giải thích sự nổi của tảng băng trôi.'
            ],
            finalAnswer: 'Vật lí lượng tử & Hóa lí; Khả năng định hướng bằng từ trường Trái Đất; Định luật vạn vật hấp dẫn; Hiện tượng cầu vồng & tán sắc ánh sáng.',
            pedagogicalNote: 'Nhấn mạnh vai trò của Vật lí là cơ sở và ngôn ngữ chung của mọi ngành Khoa học Tự nhiên.',
            targetCompetencyGroup: 'Nhóm B',
            errorWarning: 'Tránh nhầm lẫn giữa định luật 3 Newton với định luật vạn vật hấp dẫn.'
          },
          {
            id: 'b1_q3_p8_heat',
            type: 'IN_TEXT_QUESTION',
            title: 'Câu hỏi mục III.b (Trang 8 - Nhiệt học)',
            page: 8,
            section: 'III. Vai trò của Vật lí đối với công nghệ',
            prompt: '1. Hãy nêu tên một số thiết bị có ứng dụng các kiến thức về nhiệt.\n2. Theo em, việc sử dụng máy hơi nước nói riêng và động cơ nhiệt nói chung có những hạn chế nào?',
            stepByStepSolution: [
              '**Ý 1:** Thiết bị ứng dụng kiến thức nhiệt: Nhiệt kế thủy ngân, động cơ đốt trong (xe máy, ô tô), tua-bin hơi nước ở nhà máy nhiệt điện, tủ lạnh, điều hòa không khí, nồi áp suất, bình nóng lạnh năng lượng mặt trời.',
              '**Ý 2:** Hạn chế của động cơ nhiệt & máy hơi nước: Hiệu suất thấp ($H \\approx 10\\% - 35\\%$), tiêu thụ nhiều than đá, nhiên liệu hóa thạch, xả ra lượng lớn khí thải độc hại ($CO_2, SO_2, NO_x$, muội than) gây hiệu ứng nhà kính và biến đổi khí hậu.'
            ],
            finalAnswer: 'Nêu đúng các thiết bị nhiệt gia dụng và công nghiệp; Hiệu suất thấp, ô nhiễm môi trường do khí thải.',
            targetCompetencyGroup: 'Nhóm B',
            pedagogicalNote: 'Gợi mở tư duy phát triển bền vững và chuyển đổi sang năng lượng xanh.'
          },
          {
            id: 'b1_q4_p9_motor',
            type: 'IN_TEXT_QUESTION',
            title: 'Câu hỏi mục III.b (Trang 9 - Động cơ điện)',
            page: 9,
            section: 'III. Vai trò của Vật lí trong sản xuất',
            prompt: 'Theo em, sử dụng động cơ điện có những ưu điểm vượt trội nào so với sử dụng máy hơi nước?',
            stepByStepSolution: [
              '1. **Hiệu suất chuyển hóa năng lượng cao hơn rất nhiều:** Động cơ điện đạt hiệu suất $90\\% - 96\\%$, trong khi máy hơi nước chỉ đạt $10\\% - 15\\%$.',
              '2. **Bảo vệ môi trường:** Không xả trực tiếp khói bụi, khí thải nhà kính tại nơi vận hành.',
              '3. **Kích thước gọn nhẹ, độ bền cao, điều khiển tự động linh hoạt:** Dễ dàng khởi động, đảo chiều quay, tích hợp vi mạch điều khiển chính xác.',
              '4. **Nguồn năng lượng truyền tải thuận tiện:** Dòng điện dễ dàng phân phối qua lưới điện quốc gia mà không cần vận chuyển than đá cồng kềnh.'
            ],
            finalAnswer: 'Hiệu suất vượt trội (trên 90%), sạch không khí thải tại chỗ, kích thước nhỏ gọn, dễ điều khiển tự động.',
            targetCompetencyGroup: 'Nhóm B',
            errorWarning: 'Học sinh thường quên ý về tính truyền tải dễ dàng của điện năng so với than đá.'
          },
          {
            id: 'b1_q5_p10_society',
            type: 'IN_TEXT_QUESTION',
            title: 'Câu hỏi mục III.c (Trang 10 - Tác động 2 mặt)',
            page: 10,
            section: 'III. Ảnh hưởng của Vật lí đến đời sống và môi trường',
            prompt: '1. Hãy nêu mối liên quan giữa các lĩnh vực của Vật lí đối với một số dụng cụ gia đình mà em thường sử dụng.\n2. Hãy nói về ảnh hưởng của Vật lí đối với một số lĩnh vực: giao thông vận tải; thông tin liên lạc; năng lượng; du hành vũ trụ...\n3. Hãy nêu ví dụ về ô nhiễm môi trường và huỷ hoại hệ sinh thái mà em biết ở địa phương mình.',
            stepByStepSolution: [
              '**Ý 1:** Quạt điện (Điện từ học biến điện năng thành cơ năng), Lò vi sóng (Sóng điện từ tần số cao làm dao động phân tử nước), Tủ lạnh (Nhiệt động lực học chu trình bay hơi - ngưng tụ), Đèn LED (Vật lí bán dẫn quang điện tử).',
              '**Ý 2:** Giao thông (tàu hỏa siêu tốc Shinkansen, xe điện thông minh), Thông tin liên lạc (cáp quang dựa trên phản xạ toàn phần, sóng vô tuyến vệ tinh 5G), Năng lượng (điện gió, pin quang điện mặt trời), Vũ trụ (vệ tinh viễn thám, kính viễn vọng không gian James Webb).',
              '**Ý 3:** Khói bụi từ phương tiện giao thông chạy xăng dầu gây ô nhiễm không khí; Rác thải nhựa và pin điện tử chưa qua xử lý làm nhiễm độc nguồn nước và đất.'
            ],
            finalAnswer: 'Phân tích cụ thể các thiết bị gia đình, 4 lĩnh vực hạ tầng kĩ thuật và tác động môi trường địa phương.',
            targetCompetencyGroup: 'Nhóm A',
            pedagogicalNote: 'Rèn luyện cho học sinh thái độ sống có trách nhiệm với môi trường và sử dụng công nghệ an toàn.'
          },
          {
            id: 'b1_q6_p11_models',
            type: 'IN_TEXT_QUESTION',
            title: 'Câu hỏi mục IV.2 (Trang 11 - Phương pháp mô hình)',
            page: 11,
            section: 'IV. Phương pháp nghiên cứu Vật lí',
            prompt: '1. Hãy kể tên một số mô hình vật chất mà em thấy trong phòng thí nghiệm.\n2. Hãy nêu tên một số mô hình lí thuyết mà em đã học.\n3. Các mô hình toán học vẽ ở Hình 1.9 dùng để mô tả loại chuyển động nào?',
            stepByStepSolution: [
              '**Ý 1. Mô hình vật chất:** Quả địa cầu thu nhỏ của Trái Đất, mô hình bộ xương người, mô hình cấu tạo mắt, mô hình mẫu nguyên tử Rutherford - Bohr.',
              '**Ý 2. Mô hình lí thuyết:** "Chất điểm" (coi vật có khối lượng nhưng kích thước rất nhỏ so với quãng đường chuyển động), "Tia sáng" (đường truyền của chùm sáng hẹp), "Khí lí tưởng", "Vật đen tuyệt đối".',
              '**Ý 3. Mô hình toán học ở Hình 1.9:**\n- Hình 1.9a: Đồ thị quãng đường - thời gian ($s - t$) là đường thẳng đi qua gốc tọa độ $\\rightarrow$ Mô tả **Chuyển động thẳng đều** ($s = v.t$).\n- Hình 1.9b: Đồ thị vận tốc - thời gian ($v - t$) là đường thẳng nằm ngang song song với trục thời gian $t$ $\\rightarrow$ Mô tả **Chuyển động thẳng đều** ($v = const$).'
            ],
            finalAnswer: 'Mô hình vật chất: Quả địa cầu, mô hình mắt; Mô hình lí thuyết: Chất điểm, tia sáng; Mô hình Toán học: Chuyển động thẳng đều.',
            targetCompetencyGroup: 'Nhóm B',
            errorWarning: 'Học sinh hay nhầm lẫn đồ thị s-t bậc 1 với chuyển động nhanh dần đều.'
          }
        ]
      },
      {
        lessonId: 2,
        chapterId: 1,
        lessonNumber: 2,
        lessonTitle: 'Các quy tắc an toàn trong phòng thực hành Vật lí',
        pageRange: 'Trang 12 - 16',
        totalQuestions: 4,
        questions: [
          {
            id: 'b2_q1_p12',
            type: 'IN_TEXT_QUESTION',
            title: 'Câu hỏi mục I.1 (Trang 12 - Bộ đổi nguồn điện)',
            page: 12,
            section: 'I. An toàn khi sử dụng thiết bị thí nghiệm',
            prompt: '1. Chức năng của hai thiết bị (máy biến áp và bộ chuyển đổi điện áp) là gì? Giống và khác nhau như thế nào?\n2. Bộ chuyển đổi điện áp (Hình 2.1b) sử dụng hiệu điện thế vào bao nhiêu?\n3. Các hiệu điện thế đầu ra như thế nào?\n4. Những nguy cơ nào có thể gây mất an toàn hoặc hỏng các thiết bị khi sử dụng thiết bị chuyển đổi điện áp này?',
            stepByStepSolution: [
              '**Ý 1. Chức năng:** Đều dùng để thay đổi (hạ áp) hiệu điện thế từ nguồn điện xoay chiều dân dụng ($220\\text{ V}$) xuống các mức điện áp an toàn ($3\\text{ V} - 24\\text{ V}$).',
              '• *Giống nhau:* Đều nhận nguồn vào là dòng điện xoay chiều $220\\text{ V}$ và cung cấp nguồn ra hạ áp an toàn.',
              '• *Khác nhau:* Máy biến áp (Hình 2.1a) cho phép tùy chọn nhiều nấc điện áp ra xoay chiều (AC) hoặc một chiều (DC) qua núm xoay; Bộ chuyển đổi adapter (Hình 2.1b) thường cho một mức điện áp ra một chiều (DC) cố định (ví dụ $12\\text{ V}$).',
              '**Ý 2. Hiệu điện thế vào:** $U_{in} = 220\\text{ V} - 240\\text{ V}$ dòng xoay chiều tần số $50/60\\text{ Hz}$.',
              '**Ý 3. Hiệu điện thế ra:** $3\\text{ V}, 6\\text{ V}, 9\\text{ V}, 12\\text{ V}, 18\\text{ V}, 24\\text{ V}$ (với máy biến áp) hoặc $12\\text{ V}$ DC (với adapter).',
              '**Ý 4. Nguy cơ mất an toàn:** Cắm nhầm nguồn điện vượt quá công suất định mức; Chọn sai nấc điện áp làm cháy bóng đèn/thiết bị điện tử; Chập đoản mạch 2 chốt đầu ra gây cháy nổ.'
            ],
            finalAnswer: 'Hạ áp an toàn từ 220V xuống 3-24V; Điện áp vào 220V AC; Nguy cơ đoản mạch, cắm sai cực tính hoặc quá tải công suất.',
            targetCompetencyGroup: 'Nhóm B',
            errorWarning: 'Không phân biệt rõ cổng ra AC (xoay chiều) và DC (một chiều).'
          },
          {
            id: 'b2_q2_p14',
            type: 'IN_TEXT_QUESTION',
            title: 'Câu hỏi mục II.2 (Trang 14 - Ampe kế)',
            page: 14,
            section: 'II. Nguy cơ hỏng thiết bị đo điện',
            prompt: '1. Giới hạn đo của ampe kế ở Hình 2.5 là bao nhiêu?\n2. Nếu sử dụng ampe kế để đo dòng điện vượt quá giới hạn đo thì có thể gây ra nguy cơ gì?',
            summary: '• Ampe kế có $2$ thang đo chốt dương: $0{,}6\\text{ A}$ và $3\\text{ A}$.',
            stepByStepSolution: [
              '**Ý 1. Giới hạn đo (GHĐ):** Tùy thuộc vào chốt cắm dây đo:',
              '• Nếu cắm chốt $(-)$ và chốt dương $0,6\\text{ A}$: $\\text{GHĐ} = 0,6\\text{ A}$, độ chia nhỏ nhất $(\\text{ĐCNN}) = 0,02\\text{ A}$.',
              '• Nếu cắm chốt $(-)$ và chốt dương $3\\text{ A}$: $\\text{GHĐ} = 3\\text{ A}$, $\\text{ĐCNN} = 0,1\\text{ A}$.',
              '**Ý 2. Nguy cơ:** Khi dòng điện đo vượt quá GHĐ, kim chỉ thị bị va đập mạnh vào chốt chặn gây cong gãy kim, đứt cuộn dây khung quay hoặc cháy hỏng ampe kế do hiệu ứng nhiệt Joule.'
            ],
            finalAnswer: 'GHĐ là 0,6 A hoặc 3 A tùy chốt cắm; Quá tải làm gãy kim, đứt cuộn dây khung quay hoặc chập cháy thiết bị.',
            targetCompetencyGroup: 'Nhóm A',
            pedagogicalNote: 'Quy tắc an toàn bất biến: Luôn chọn thang đo lớn nhất trước rồi hạ dần xuống thang đo phù hợp.'
          },
          {
            id: 'b2_q3_p15',
            type: 'IN_TEXT_QUESTION',
            title: 'Câu hỏi mục II.2 (Trang 15 - Đồng hồ vạn năng VOM)',
            page: 15,
            section: 'II. Sử dụng đồng hồ vạn năng DMM',
            prompt: 'Điều chỉnh vị trí của kim đo, chọn thang đo và cắm các dây đo trên đồng hồ đa năng (Hình 2.6) để đo hiệu điện thế, cường độ dòng điện và điện trở như thế nào?',
            stepByStepSolution: [
              '1. **Đo hiệu điện thế xoay chiều/một chiều:**',
              '• Chuyển núm xoay về dải đo điện áp: $V\\sim$ (ACV) cho điện xoay chiều hoặc $V-$ (DCV) cho điện một chiều.',
              '• Dây đen cắm cổng chung `COM`, dây đỏ cắm cổng `V/\\Omega`.',
              '• Mắc đồng hồ **song song** với đoạn mạch cần đo.',
              '2. **Đo cường độ dòng điện:**',
              '• Chuyển núm xoay về dải đo dòng điện ($A\\sim$ hoặc $A-$), chọn mức cường độ dự kiến ($mA$ hoặc $10A$).',
              '• Dây đen cắm `COM`, dây đỏ cắm cổng `mA` hoặc `10A`. Mắc **nối tiếp** vào mạch điện.',
              '3. **Đo điện trở:**',
              '• Chuyển núm về vùng $\\Omega$. Ngắt hoàn toàn nguồn điện của mạch trước khi đo điện trở.'
            ],
            finalAnswer: 'Vặn đúng núm chức năng (V/A/\\Omega); Dây đen cắm COM, dây đỏ cắm V/\\Omega hoặc mA/10A; Đo V mắc song song, đo I mắc nối tiếp, đo R phải ngắt nguồn.',
            targetCompetencyGroup: 'Nhóm B',
            errorWarning: 'Sai lầm nguy hiểm nhất: Để thang đo điện trở hoặc thang đo dòng điện A mà cắm trực tiếp vào nguồn 220V gây nổ đồng hồ!'
          },
          {
            id: 'b2_q4_p16_em_co_the',
            type: 'EM_CO_THE',
            title: 'Em có thể (Trang 16 - Vận dụng quy tắc)',
            page: 16,
            section: 'Em có thể',
            prompt: 'Giải thích được vì sao:\n1. Khi sử dụng thiết bị đo điện, phải luôn đặt ở thang đo phù hợp.\n2. Khi sử dụng máy biến áp phải đặt nút điều chỉnh điện áp ở mức thấp nhất rồi tăng dần lên.',
            stepByStepSolution: [
              '**1. Đặt thang đo phù hợp:**',
              '• Nếu đặt thang đo quá nhỏ: Dòng điện hoặc điện áp vượt ngưỡng làm quá tải, đứt cầu chì hoặc cháy cuộn dây đồng hồ.',
              '• Nếu đặt thang đo quá lớn: Kim dao động ở góc rất nhỏ, khó đọc vạch chia dẫn đến sai số phép đo rất lớn.',
              '**2. Đặt nút điều chỉnh máy biến áp ở mức thấp nhất rồi tăng dần:**',
              '• Tránh sốc điện áp đột ngột gây cháy bóng đèn hoặc linh kiện mạch thí nghiệm.',
              '• Giúp người làm thí nghiệm kịp thời quan sát trạng thái của mạch và ngắt nguồn nếu có hiện tượng chạm chập bất thường.'
            ],
            finalAnswer: 'Bảo vệ an toàn thiết bị đo, giảm thiểu sai số đo; Ngăn chặn sốc quá áp làm cháy hỏng linh kiện thí nghiệm.',
            targetCompetencyGroup: 'Nhóm A'
          }
        ]
      },
      {
        lessonId: 3,
        chapterId: 1,
        lessonNumber: 3,
        lessonTitle: 'Thực hành tính sai số trong phép đo. Ghi kết quả đo',
        pageRange: 'Trang 17 - 19',
        totalQuestions: 4,
        questions: [
          {
            id: 'b3_q1_p17',
            type: 'IN_TEXT_QUESTION',
            title: 'Câu hỏi mục I (Trang 17 - Phương án đo tốc độ xe đồ chơi)',
            page: 17,
            section: 'I. Phép đo trực tiếp và phép đo gián tiếp',
            interactiveKey: 'TOY_CAR_SPEED',
            prompt: 'Em hãy lập phương án đo tốc độ chuyển động của chiếc xe ô tô đồ chơi chỉ dùng thước; đồng hồ bấm giây và trả lời các câu hỏi sau:\na) Để đo tốc độ chuyển động của xe cần đo những đại lượng nào?\nb) Xác định tốc độ chuyển động của xe theo công thức nào?\nc) Phép đo nào là phép đo trực tiếp? Tại sao?\nd) Phép đo nào là phép đo gián tiếp? Tại sao?',
            stepByStepSolution: [
              '### 1. Phương án thí nghiệm đo tốc độ xe ô tô đồ chơi:',
              '**a) Dụng cụ thí nghiệm:**',
              '• 01 Xe ô tô đồ chơi (có động cơ pin/dây cót).',
              '• 01 Thước đo chiều dài (thước cuộn/thước thẳng, ĐCNN $1\\text{ mm}$).',
              '• 01 Đồng hồ bấm giây (ĐCNN $0,01\\text{ s}$).',
              '• Phấn vẽ hoặc băng dính màu để đánh dấu vạch trên mặt sàn phẳng.',
              '',
              '**b) Các bước tiến hành thí nghiệm:**',
              '1. **Xác định khoảng cách đo:** Dùng thước đo một khoảng quãng đường cố định trên mặt sàn (ví dụ: $s = 1\\text{ m}$), dùng phấn vạch rõ **vạch xuất phát $(A)$** và **vạch đích $(B)$**.',
              '2. **Lấy đà ổn định tốc độ:** Cho xe ô tô đồ chơi chạy từ vị trí *trước vạch xuất phát* để xe đạt tốc độ chuyển động ổn định trước khi đến vạch $A$.',
              '3. **Bấm giờ:** Bấm đồng hồ đo thời gian $t$ ngay khi mép trước xe vừa chạm vạch xuất phát $A$ và dừng đồng hồ khi mép trước xe vừa chạm vạch đích $B$.',
              '4. **Lặp lại phép đo:** Lặp lại phép đo khoảng **3–5 lần** để ghi lại bảng số liệu và lấy giá trị trung bình $\\bar{t}$ nhằm giảm thiểu sai số ngẫu nhiên do phản xạ tay người.',
              '5. **Xác định tốc độ:** Tính tốc độ trung bình theo công thức $v = \\frac{s}{t}$ và xử lý sai số toàn phần.',
              '',
              '### 2. Trả lời chi tiết các câu hỏi:',
              '**a) Các đại lượng cần đo:** Cần đo quãng đường chuyển động $s$ của ô tô và thời gian $t$ để ô tô đi hết quãng đường đó.',
              '**b) Công thức xác định tốc độ:** $$v = \\frac{s}{t}$$',
              '**c) Phép đo trực tiếp:**',
              '• Phép đo quãng đường $s$ (dùng thước thẳng) và phép đo thời gian $t$ (dùng đồng hồ bấm giây) là **phép đo trực tiếp** vì giá trị của chúng được đọc trực tiếp trên thang chia độ của dụng cụ đo.',
              '**d) Phép đo gián tiếp:**',
              '• Phép xác định tốc độ $v$ là **phép đo gián tiếp** vì không có dụng cụ đo trực tiếp $v$ trong thí nghiệm này, mà giá trị của $v$ được suy ra qua công thức liên hệ toán học $v = \\frac{s}{t}$ từ hai đại lượng đo trực tiếp $s$ và $t$.'
            ],
            finalAnswer: 'Phương án gồm: Thước đo s = 1m, đồng hồ bấm t qua 3-5 lần; Công thức v = s/t; Đo s và t là trực tiếp; Đo v là gián tiếp.',
            targetCompetencyGroup: 'Nhóm A',
            pedagogicalNote: 'Giúp học sinh hiểu sâu sắc quy trình thực nghiệm Vật lí: Lập phương án, chuẩn bị dụng cụ, tiến hành đo lặp lại để khử sai số ngẫu nhiên, và phân biệt phép đo trực tiếp với phép đo gián tiếp.'
          },
          {
            id: 'b3_q2_p19_table',
            type: 'EXERCISE',
            title: 'Bài tập xử lý số liệu Bảng 3.1 (Trang 19)',
            page: 19,
            section: 'Xử lí số liệu thực nghiệm',
            prompt: 'Dùng một thước có ĐCNN là 1 mm và một đồng hồ đo thời gian có ĐCNN 0,01 s để đo 5 lần thời gian chuyển động của xe từ điểm A đến B (quãng đường $s = 0,5\\text{ m}$). Cho bảng số liệu thời gian: $t_1 = 0,52\\text{ s}$; $t_2 = 0,54\\text{ s}$; $t_3 = 0,53\\text{ s}$; $t_4 = 0,51\\text{ s}$; $t_5 = 0,53\\text{ s}$. Hãy:\na) Tính sai số tuyệt đối và điền vào bảng.\nb) Viết kết quả đo $s$, $t$ và tính sai số tỉ đối của tốc độ $v$.\nc) Viết kết quả đo của $v$.',
            summary: '• Quãng đường: $s = 0{,}5\\text{ m}$ (ĐCNN thước: $1\\text{ mm} = 0{,}001\\text{ m}$)\n• Thời gian $5$ lần đo:\n  - $t_1 = 0{,}52\\text{ s}$; $t_2 = 0{,}54\\text{ s}$; $t_3 = 0{,}53\\text{ s}$\n  - $t_4 = 0{,}51\\text{ s}$; $t_5 = 0{,}53\\text{ s}$\n• ĐCNN đồng hồ đo: $0{,}01\\text{ s}$',
            stepByStepSolution: [
              '**1. Tính giá trị trung bình của thời gian $\\bar{t}$:**',
              '$$\\bar{t} = \\frac{0,52 + 0,54 + 0,53 + 0,51 + 0,53}{5} = \\frac{2,63}{5} = 0,526\\text{ s} \\approx 0,53\\text{ s}$$',
              '**2. Tính sai số ngẫu nhiên từng lần đo:**',
              '• $\\Delta t_1 = |0,526 - 0,52| = 0,006\\text{ s}$',
              '• $\\Delta t_2 = |0,526 - 0,54| = 0,014\\text{ s}$',
              '• $\\Delta t_3 = |0,526 - 0,53| = 0,004\\text{ s}$',
              '• $\\Delta t_4 = |0,526 - 0,51| = 0,016\\text{ s}$',
              '• $\\Delta t_5 = |0,526 - 0,53| = 0,004\\text{ s}$',
              '$$\\overline{\\Delta t} = \\frac{0,006 + 0,014 + 0,004 + 0,016 + 0,004}{5} = 0,0088\\text{ s}$$',
              'Sai số dụng cụ $\\Delta t_{dc} = 0,01\\text{ s}$. Sai số tuyệt đối: $\\Delta t = \\overline{\\Delta t} + \\Delta t_{dc} = 0,0088 + 0,01 = 0,0188\\text{ s} \\approx 0,02\\text{ s}$.',
              'Kết quả đo thời gian: $t = (0,53 \\pm 0,02)\\text{ s}$.',
              '**3. Kết quả đo quãng đường:**',
              'Quãng đường $s = 0,5\\text{ m} = 500\\text{ mm}$, $\\Delta s = \\Delta s_{dc} = 1\\text{ mm} = 0,001\\text{ m}$. Kết quả: $s = (0,500 \\pm 0,001)\\text{ m}$.',
              '**4. Sai số tỉ đối của tốc độ $v$:**',
              '$$\\delta s = \\frac{\\Delta s}{\\bar{s}} = \\frac{0,001}{0,5} \\times 100\\% = 0,2\\%$$',
              '$$\\delta t = \\frac{\\Delta t}{\\bar{t}} = \\frac{0,02}{0,53} \\times 100\\% \\approx 3,77\\%$$',
              '$$\\delta v = \\delta s + \\delta t = 0,2\\% + 3,77\\% = 3,97\\% \\approx 4,0\\%$$',
              '**5. Tốc độ trung bình và sai số tuyệt đối của $v$:**',
              '$$\\bar{v} = \\frac{\\bar{s}}{\\bar{t}} = \\frac{0,5}{0,526} \\approx 0,9506\\text{ m/s}$$',
              '$$\\Delta v = \\bar{v} \\times \\delta v = 0,9506 \\times 3,97\\% \\approx 0,038\\text{ m/s} \\approx 0,04\\text{ m/s}$$',
              'Kết quả đo tốc độ: $v = (0,95 \\pm 0,04)\\text{ m/s}$.'
            ],
            finalAnswer: '$s = (0,500 \\pm 0,001)\\text{ m}$; $t = (0,53 \\pm 0,02)\\text{ s}$; $\\delta v \\approx 4,0\\%$; $v = (0,95 \\pm 0,04)\\text{ m/s}$.',
            targetCompetencyGroup: 'Nhóm C',
            errorWarning: 'Học sinh hay mắc sai lầm: Quên cộng sai số dụng cụ hoặc tính sai quy tắc làm tròn chữ số có nghĩa!'
          }
        ]
      }
    ]
  },
  {
    chapterId: 2,
    romanNumeral: 'II',
    chapterTitle: 'ĐỘNG HỌC',
    lessons: [
      {
        lessonId: 4,
        chapterId: 2,
        lessonNumber: 4,
        lessonTitle: 'Độ dịch chuyển và quãng đường đi được',
        pageRange: 'Trang 21 - 25',
        totalQuestions: 5,
        questions: [
          {
            id: 'b4_q1_p21_khoi_dong',
            type: 'IN_TEXT_QUESTION',
            title: 'Khởi động (Trang 21 - Ngã tư đường)',
            page: 21,
            section: 'Khởi động',
            interactiveKey: 'INTERSECTION_4_WAYS',
            prompt: 'Một ô tô đi tới điểm O của một ngã tư đường có 4 hướng: Đông, Tây, Nam, Bắc với tốc độ không đổi 36 km/h. Nếu ô tô đi tiếp thì sau 10 s:\na) Quãng đường đi tiếp của ô tô là bao nhiêu mét?\nb) Vị trí của ô tô ở điểm nào trên hình vẽ?',
            summary: '• Tốc độ không đổi: $v = 36\\text{ km/h} = 10\\text{ m/s}$\n• Thời gian đi tiếp: $t = 10\\text{ s}$\n• Tỉ xích trên hình: Mỗi đoạn chia bằng $50\\text{ m}$',
            frameOfReference: 'Gốc tọa độ tại ngã tư O (0m), trục Ox hướng Đông (+), trục Oy hướng Bắc (+).',
            formula: 's = v . t',
            stepByStepSolution: [
              '**a) Đổi đơn vị và tính quãng đường đi tiếp của ô tô ($s$):**',
              '• Đổi tốc độ sang đơn vị SI: $v = 36\\text{ km/h} = \\frac{36}{3,6} = 10\\text{ m/s}$.',
              '• Quãng đường ô tô đi tiếp sau thời gian $t = 10\\text{ s}$ là: $$s = v \\times t = 10 \\times 10 = 100\\text{ m}$$',
              '**b) Xác định vị trí của ô tô trên hình vẽ:**',
              '• Trên hình vẽ, mỗi đoạn chia ứng với $50\\text{ m}$. Do đó, khoảng cách $100\\text{ m}$ tương ứng với $2$ đoạn chia từ gốc O ($2 \\times 50\\text{ m} = 100\\text{ m}$).',
              '• Vì đề bài **chưa cho biết hướng chuyển động** của ô tô sau khi qua ngã tư O, nên ô tô có thể ở một trong 4 vị trí sau:',
              '  - Nếu ô tô đi tiếp theo hướng **Bắc**: Vị trí ô tô là điểm **B** (cách O $100\\text{ m}$).',
              '  - Nếu ô tô rẽ sang hướng **Đông**: Vị trí ô tô là điểm **L** (cách O $100\\text{ m}$).',
              '  - Nếu ô tô rẽ sang hướng **Nam**: Vị trí ô tô là điểm **E** (cách O $100\\text{ m}$).',
              '  - Nếu ô tô rẽ sang hướng **Tây**: Vị trí ô tô là điểm **H** (cách O $100\\text{ m}$).'
            ],
            finalAnswer: 'a) Quãng đường: s = 100 m.\nb) Vị trí của ô tô: Điểm B (nếu đi hướng Bắc), điểm L (nếu đi hướng Đông), điểm E (nếu đi hướng Nam) hoặc điểm H (nếu đi hướng Tây).',
            targetCompetencyGroup: 'Nhóm A',
            pedagogicalNote: 'Qua câu hỏi khởi động, học sinh nhận thấy: Chỉ biết quãng đường s = 100 m là chưa đủ để xác định vị trí của vật mà cần phải biết thêm hướng chuyển động -> Cần thiết phải đưa ra khái niệm Độ dịch chuyển d (đại lượng vectơ).',
            errorWarning: 'Sai lầm thường gặp: Quên đổi đơn vị km/h sang m/s hoặc chỉ trả lời một hướng mà không xét cả 4 khả năng.'
          },
          {
            id: 'b4_q2_p22_hanoi_haiphong',
            type: 'IN_TEXT_QUESTION',
            title: 'Câu hỏi mục I (Trang 22 - Bản đồ Hà Nội - Hải Phòng)',
            page: 22,
            section: 'I. Vị trí của vật chuyển động',
            interactiveKey: 'LESSON4_HANOI_HAIPHONG',
            prompt: 'Hãy dùng bản đồ Việt Nam và hệ toạ độ địa lí, xác định vị trí của thành phố Hải Phòng so với vị trí của Thủ đô Hà Nội.',
            summary: '• Gốc tọa độ O: Thủ đô Hà Nội (21°02\'B, 105°51\'Đ)\n• Điểm cần xác định: TP. Hải Phòng (20°51\'B, 106°41\'Đ)\n• Trục tọa độ: Bắc - Nam và Tây - Đông\n• Khoảng cách đường chim bay: ~102 km\n• Hướng: Đông - Đông Nam (lệch ~15° về phía Nam so với hướng Đông)',
            stepByStepSolution: [
              '1. **Chọn hệ quy chiếu địa lí và gốc tọa độ:**',
              '• Chọn gốc tọa độ $O$ trùng với vị trí **Thủ đô Hà Nội** ($21^\\circ 02\'\\text{B}, 105^\\circ 51\'\\text{Đ}$).',
              '• Trục thẳng đứng hướng Bắc ($Oy$), trục nằm ngang hướng Đông ($Ox$).',
              '2. **Đo đạc khoảng cách và xác định phương hướng:**',
              '• **Đo khoảng cách (Đường chim bay):** Đặt thước đo từ Hà Nội đến Hải Phòng, đối chiếu tỉ xích bản đồ ($1\\text{ cm} \\approx 20\\text{ km}$) ta được khoảng cách: $$d \\approx 102\\text{ km} - 105\\text{ km}$$',
              '• **Xác định phương hướng:**',
              '  - Hải Phòng nằm ở phía Đông của Hà Nội, lệch về phía Nam khoảng $15^\\circ$ (hướng Đông - Đông Nam).',
              '  - Hoặc góc phương vị so với hướng Bắc theo chiều kim đồng hồ là: $\\alpha \\approx 90^\\circ + 15^\\circ = 105^\\circ$.',
              '3. **Kết luận vị trí của Hải Phòng so với Hà Nội:**',
              '• Thành phố Hải Phòng cách Thủ đô Hà Nội khoảng $102\\text{ km}$ theo hướng **Đông - Đông Nam** (góc lệch khoảng $105^\\circ$ so với hướng Bắc).'
            ],
            finalAnswer: 'Vị trí Hải Phòng cách Thủ đô Hà Nội khoảng 102 km - 105 km theo hướng Đông - Đông Nam (góc lệch ~105° so với hướng Bắc).',
            targetCompetencyGroup: 'Nhóm B',
            pedagogicalNote: 'Khắc sâu phương pháp xác định vị trí trong Vật lí: Cần đầy đủ 1) Vật làm mốc (Gốc O), 2) Khoảng cách đến mốc (d), và 3) Hướng xác định (Góc lệch so với trục chuẩn).'
          },
          {
            id: 'b4_q3_p23_phan_biet',
            type: 'IN_TEXT_QUESTION',
            title: 'Câu hỏi mục II (Trang 23 - So sánh s và d ở Hình 4.6)',
            page: 23,
            section: 'II. Phân biệt độ dịch chuyển và quãng đường đi được',
            interactiveKey: 'LESSON4_THREE_PATHS',
            prompt: '1. Hãy so sánh độ lớn của độ dịch chuyển và quãng đường đi được của ba chuyển động ở Hình 4.6 (Xe máy 1 đi theo đường 1, Người đi bộ 2 đi theo đường 2, Ô tô 3 đi theo đường 3 cùng xuất phát từ Siêu thị A đến Bưu điện B).\n2. Theo em, khi nào độ lớn của độ dịch chuyển và quãng đường đi được của một chuyển động bằng nhau?',
            summary: '• Điểm đầu: Siêu thị (A); Điểm cuối: Bưu điện (B)\n• Đường 1: Xe máy (vòng phía Tây)\n• Đường 2: Người đi bộ (đi thẳng hướng Bắc)\n• Đường 3: Ô tô (vòng phía Đông)\n• Tỉ xích: 1 cm ứng với 100 m',
            stepByStepSolution: [
              '**1. So sánh độ lớn Độ dịch chuyển ($d$) và Quãng đường ($s$) ở Hình 4.6:**',
              '• **Về độ dịch chuyển ($\vec{d}$):** Cả 3 người (xe máy 1, người đi bộ 2, ô tô 3) đều xuất phát từ điểm $A$ (Siêu thị) và cùng kết thúc tại điểm $B$ (Bưu điện).',
              '  - Vectơ độ dịch chuyển $\\vec{d} = \\vec{AB}$ có gốc tại $A$, ngọn tại $B$, hướng thẳng từ Nam lên Bắc.',
              '  - Vì điểm đầu và điểm cuối giống nhau nên **độ lớn độ dịch chuyển của cả 3 chuyển động là hoàn toàn bằng nhau**:',
              '  $$d_1 = d_2 = d_3 = AB = 400\\text{ m}$$',
              '• **Về quãng đường đi được ($s$ - độ dài quỹ đạo thực tế):**',
              '  - Người đi bộ (2) đi theo đường thẳng trực tiếp từ A đến B nên: $s_2 = AB = 400\\text{ m}$.',
              '  - Người đi xe máy (1) rẽ sang các con phố phía Tây rồi mới đến B nên: $s_1 > AB$ ($s_1 \\approx 680\\text{ m}$).',
              '  - Người đi ô tô (3) rẽ sang đại lộ phía Đông với đường vòng xa hơn nên: $s_3 > s_1 > AB$ ($s_3 \\approx 850\\text{ m}$).',
              '  - **Kết luận thứ tự so sánh quãng đường:** $$s_2 < s_1 < s_3$$',
              '**2. Điều kiện để độ lớn độ dịch chuyển bằng quãng đường ($d = s$):**',
              '• Độ lớn của độ dịch chuyển và quãng đường đi được của một chuyển động bằng nhau ($|\\vec{d}| = s$) khi và chỉ khi **vật chuyển động thẳng và không đổi chiều chuyển động**.',
              '• Nếu vật chuyển động cong, gấp khúc (như xe máy 1 và ô tô 3) hoặc chuyển động thẳng nhưng có đổi chiều quay lại thì luôn có: $$|\\vec{d}| < s$$'
            ],
            finalAnswer: '1. Độ lớn độ dịch chuyển: d₁ = d₂ = d₃ = AB = 400 m.\nQuãng đường: s₂ < s₁ < s₃ (với s₂ = d = 400 m).\n2. d = s khi và chỉ khi vật chuyển động thẳng và không đổi chiều.',
            targetCompetencyGroup: 'Nhóm A',
            pedagogicalNote: 'Khắc sâu bản chất: Độ dịch chuyển d là đại lượng vectơ chỉ phụ thuộc vào vị trí điểm đầu và điểm cuối, không phụ thuộc vào hình dạng quỹ đạo. Quãng đường s là đại lượng vô hướng đo độ dài thực tế toàn bộ đường đi.'
          },
          {
            id: 'b4_q4_p24_bang_so_lieu',
            type: 'EXERCISE',
            title: 'Bài tập bảng 4.1 (Trang 24 - Đi xe đạp qua trạm xăng, siêu thị)',
            page: 24,
            section: 'Vận dụng tính s và d',
            interactiveKey: 'LESSON4_BICYCLE_TRIP',
            prompt: 'Bạn A đi xe đạp từ nhà (N) qua trạm xăng (X = 400 m), tới siêu thị (S = 800 m) mua đồ rồi quay về nhà cất đồ, sau đó đi xe đến trường (T = 1200 m theo chiều dương).\n1. Chọn gốc tại nhà bạn A, chiều dương từ nhà đến trường.\na) Tính quãng đường đi được và độ dịch chuyển khi đi từ trạm xăng đến siêu thị.\nb) Tính quãng đường đi được và độ dịch chuyển của cả chuyến đi.\n2. Điền kết quả vào Bảng 4.1.',
            summary: '• Tọa độ các vị trí: $N = 0\\text{ m}$; $X = 400\\text{ m}$; $S = 800\\text{ m}$; $T = 1200\\text{ m}$.',
            frameOfReference: 'Gốc tọa độ tại nhà A (N = 0), trục Ox theo chiều từ Nhà đến Trường.',
            stepByStepSolution: [
              '**a) Chặng từ Trạm xăng (X) đến Siêu thị (S):**',
              '• Quãng đường: $s_{XS} = x_S - x_X = 800 - 400 = 400\\text{ m}$.',
              '• Độ dịch chuyển: $d_{XS} = x_S - x_X = 800 - 400 = +400\\text{ m}$ (hướng từ Nhà sang Trường).',
              '**b) Cả chuyến đi (Nhà $\\rightarrow$ Trạm xăng $\\rightarrow$ Siêu thị $\\rightarrow$ Nhà $\\rightarrow$ Trường):**',
              '• Quãng đường tổng cộng: $s = s_{N \\rightarrow S} + s_{S \\rightarrow N} + s_{N \\rightarrow T} = 800 + 800 + 1200 = 2800\\text{ m}$.',
              '• Độ dịch chuyển cả chuyến đi (vị trí đầu là Nhà $x_1 = 0$, vị trí cuối là Trường $x_2 = 1200\\text{ m}$):',
              '$$d = x_2 - x_1 = 1200 - 0 = +1200\\text{ m}$$'
            ],
            finalAnswer: 'Từ X đến S: s = 400 m, d = +400 m; Cả chuyến đi: s = 2800 m, d = +1200 m.',
            targetCompetencyGroup: 'Nhóm B',
            errorWarning: 'Học sinh hay tính nhầm độ dịch chuyển cả chuyến đi bằng tổng quãng đường (2800 m) thay vì chỉ lấy x_cuối - x_đầu.'
          },
          {
            id: 'b4_q5_p25_oto_3_chang',
            type: 'EXERCISE',
            title: 'Bài tập 1 (Trang 25 - Ô tô đi 3 chặng Tây - Nam - Đông)',
            page: 25,
            section: 'Bài tập tự luyện',
            interactiveKey: 'LESSON4_CAR_TRIP',
            prompt: '1. Một người lái ô tô đi thẳng 6 km theo hướng Tây, sau đó rẽ trái đi thẳng theo hướng Nam 4 km rồi quay sang hướng Đông đi 3 km. Xác định quãng đường đi được và độ dịch chuyển của ô tô.',
            stepByStepSolution: [
              '• **Quãng đường đi được của ô tô:**',
              '$$s = s_1 + s_2 + s_3 = 6 + 4 + 3 = 13\\text{ km}$$',
              '• **Xác định độ dịch chuyển tổng hợp $\\vec{d}$:**',
              '  - Chiều Tây - Đông (trục $Ox$): ô tô đi $6\\text{ km}$ sang Tây $(-6)$ rồi quay lại $3\\text{ km}$ sang Đông $(+3) \\Rightarrow d_x = -6 + 3 = -3\\text{ km}$ (cách gốc $3\\text{ km}$ về phía Tây).',
              '  - Chiều Bắc - Nam (trục $Oy$): ô tô đi $4\\text{ km}$ sang Nam $\\Rightarrow d_y = -4\\text{ km}$ (cách gốc $4\\text{ km}$ về phía Nam).',
              '  - Độ lớn độ dịch chuyển theo định lí Pythagore:',
              '$$d = \\sqrt{d_x^2 + d_y^2} = \\sqrt{(-3)^2 + (-4)^2} = \\sqrt{9 + 16} = \\sqrt{25} = 5\\text{ km}$$',
              '  - Hướng dịch chuyển: hướng **Tây Nam**, tạo với hướng Tây một góc $\\alpha$ thoả mãn:',
              '$$\\tan\\alpha = \\frac{|d_y|}{|d_x|} = \\frac{4}{3} \\approx 1,333 \\Rightarrow \\alpha \\approx 53,13^\\circ$$'
            ],
            finalAnswer: 'Quãng đường s = 13 km; Độ dịch chuyển d = 5 km theo hướng Tây Nam (lệch Nam 53,13° so với hướng Tây).',
            targetCompetencyGroup: 'Nhóm C',
            errorWarning: 'Học sinh dễ nhầm lẫn giữa quãng đường s (tổng chiều dài 13 km) và độ dịch chuyển d (khoảng cách vị trí đầu - cuối 5 km).'
          },
          {
            id: 'b4_q6_p25_nguoi_boi_qua_song',
            type: 'EXERCISE',
            title: 'Bài tập 2 (Trang 25 - Người bơi ngang qua sông bị dòng nước cuốn trôi)',
            page: 25,
            section: 'Bài tập tự luyện',
            interactiveKey: 'LESSON4_SWIMMER_RIVER',
            prompt: '2. Một người bơi ngang từ bờ bên này sang bờ bên kia của dòng sông rộng 50 m có dòng chảy từ Bắc xuống Nam. Nước trôi đẩy người dạt xuôi dòng 50 m. Xác định độ dịch chuyển của người đó.',
            stepByStepSolution: [
              '• **Phân tích các độ dịch chuyển thành phần:**',
              '  - Độ dịch chuyển do người tự bơi ngang qua sông (hướng Đông): $\\vec{d_1}$ có độ lớn $d_1 = 50\\text{ m}$.',
              '  - Độ dịch chuyển do dòng nước cuốn trôi xuôi dòng (hướng Nam): $\\vec{d_2}$ có độ lớn $d_2 = 50\\text{ m}$.',
              '  - Vì phương bơi ngang vuông góc với phương dòng chảy nên $\\vec{d_1} \\perp \\vec{d_2}$.',
              '• **Xác định độ dịch chuyển tổng hợp $\\vec{d} = \\vec{d_1} + \\vec{d_2}$:**',
              '  - Áp dụng định lí Pythagore cho tam giác vuông có hai cạnh góc vuông $d_1 = 50\\text{ m}$ và $d_2 = 50\\text{ m}$:',
              '$$d = \\sqrt{d_1^2 + d_2^2} = \\sqrt{50^2 + 50^2} = \\sqrt{2500 + 2500} = \\sqrt{5000} = 50\\sqrt{2} \\approx 70,71\\text{ m}$$',
              '  - Hướng dịch chuyển: hướng **Đông Nam**, tạo với bờ sông (hướng Đông) một góc $\\alpha$:',
              '$$\\tan\\alpha = \\frac{d_2}{d_1} = \\frac{50}{50} = 1 \\Rightarrow \\alpha = 45^\\circ$$'
            ],
            finalAnswer: 'Độ dịch chuyển d = 50√2 ≈ 70,71 m theo hướng Đông Nam (tạo góc 45° so với bờ sông).',
            targetCompetencyGroup: 'Nhóm C',
            errorWarning: 'Cần lưu ý độ dịch chuyển có cả độ lớn (70,71 m) và hướng (Đông Nam lệch 45°).'
          }
        ]
      },
      {
        lessonId: 5,
        chapterId: 2,
        lessonNumber: 5,
        lessonTitle: 'Tốc độ và vận tốc',
        pageRange: 'Trang 26 - 29',
        totalQuestions: 4,
        questions: [
          {
            id: 'b5_q1_p27',
            type: 'IN_TEXT_QUESTION',
            title: 'Câu hỏi mục I.1 (Trang 27 - Điền kinh Seagames)',
            page: 27,
            section: 'I. Tốc độ trung bình',
            prompt: '1. Tại sao tốc độ này được gọi là tốc độ trung bình?\n2. Hãy tính tốc độ trung bình ra đơn vị m/s và km/h của nữ vận động viên Việt Nam tại SEA Games 30 (2019) chạy cự li 100 m hết 11,54 s.',
            summary: '• Quãng đường: $s = 100\\text{ m}$\n• Thời gian: $t = 11{,}54\\text{ s}$',
            formula: 'v_tb = s / t',
            stepByStepSolution: [
              '**1. Giải thích:** Gọi là "tốc độ trung bình" vì trong suốt cự li 100 m, tốc độ của vận động viên thay đổi liên tục (từ lúc xuất phát tăng tốc dần đến lúc chạy nước rút và về đích), đại lượng $v_{tb} = s/t$ chỉ đặc trưng cho mức độ nhanh chậm trung bình trên toàn bộ quãng đường đó.',
              '**2. Tính toán:**',
              '• Tốc độ tính theo $\\text{m/s}$:',
              '$$v_{tb} = \\frac{s}{t} = \\frac{100}{11,54} \\approx 8,6655\\text{ m/s} \\approx 8,67\\text{ m/s}$$',
              '• Quy đổi ra $\\text{km/h}$ (nhân với 3,6):',
              '$$v_{tb} = 8,6655 \\times 3,6 \\approx 31,20\\text{ km/h}$$'
            ],
            finalAnswer: 'v_tb ≈ 8,67 m/s = 31,20 km/h.',
            targetCompetencyGroup: 'Nhóm A'
          },
          {
            id: 'b5_q2_p28_vector_v',
            type: 'IN_TEXT_QUESTION',
            title: 'Câu hỏi mục II.1 (Trang 28 - Vận tốc trung bình)',
            page: 28,
            section: 'II. Vận tốc trung bình',
            prompt: 'Theo em biểu thức nào sau đây xác định giá trị vận tốc? Tại sao?\na) s / t; b) v . t; c) d / t; d) d . t',
            stepByStepSolution: [
              '• Biểu thức đúng xác định giá trị vận tốc là: **c) $\\frac{d}{t}$** (hoặc $\\vec{v} = \\frac{\\Delta \\vec{d}}{\\Delta t}$).',
              '• **Giải thích lí do:**',
              '  - Quãng đường chia thời gian $\\frac{s}{t}$ là công thức tính **tốc độ trung bình** (đại lượng vô hướng).',
              '  - Độ dịch chuyển chia thời gian $\\frac{d}{t}$ là công thức tính **vận tốc trung bình** (đại lượng vectơ, có cả độ lớn và hướng).'
            ],
            finalAnswer: 'Đáp án c) d/t vì vận tốc là thương số của độ dịch chuyển và thời gian dịch chuyển.',
            targetCompetencyGroup: 'Nhóm A'
          },
          {
            id: 'b5_q2b_p28_tangent_ruler',
            type: 'ACTIVITY',
            title: 'Hoạt động mục II.2 (Trang 28 - Xác định vận tốc tức thời bằng mép thước kẻ)',
            page: 28,
            section: 'II. Vận tốc tức thời - Ý nghĩa tiếp tuyến mép thước kẻ trên đồ thị d-t',
            interactiveKey: 'TANGENT_RULER_VELOCITY',
            prompt: 'Đặt mép thước kẻ tiếp tuyến với đồ thị hình sin độ dịch chuyển – thời gian (d - t) tại các điểm E, C, D, G, H:\n1. Tại điểm E và H (Biên)?\n2. Tại điểm C (x ≈ 0,71A)?\n3. Tại điểm D (VTCB x = 0)?\nTừ đó rút ra kết luận so sánh độ lớn vận tốc (tốc độ) tại các điểm.',
            stepByStepSolution: [
              '### 1. Phân tích độ dốc mép thước kẻ tại các điểm đặc biệt:',
              '**1. Tại điểm E và H (Biên):**',
              '• Mép thước kẻ nằm ngang (song song với trục thời gian $Ot$) $\\Rightarrow$ Độ dốc bằng $0 \\Rightarrow v_E = v_H = 0$.',
              '',
              '**2. Tại điểm C ($x \\approx 0{,}71A$ hay $d \\approx 0{,}71A$):**',
              '• Thước nghiêng dốc xuống về bên phải $\\Rightarrow v_C < 0$, tốc độ tức thời $|v_C| = 0{,}71 v_{\\max} = \\frac{\\sqrt{2}}{2} v_{\\max}$.',
              '',
              '**3. Tại điểm D (Vị trí cân bằng VTCB $x = 0$):**',
              '• Thước có độ dốc lớn nhất (dốc đứng nhất hướng xuống) $\\Rightarrow$ Tốc độ cực đại $|v_D| = v_{\\max} = \\omega A$.',
              '',
              '**4. Tại điểm G ($x \\approx -0{,}71A$):**',
              '• Thước tiếp tục dốc xuống với độ dốc bằng điểm C $\\Rightarrow |v_G| = 0{,}71 v_{\\max} = |v_C|$.',
              '',
              '### 2. Kết luận so sánh độ lớn vận tốc (tốc độ):',
              '$$|v_D| > |v_C| = |v_G| > |v_E| = |v_H| = 0$$',
              '*Ý nghĩa vật lí:* Độ dốc $k = \\tan\\alpha = \\frac{\\Delta d}{\\Delta t}$ của tiếp tuyến với đồ thị $(d - t)$ biểu diễn vận tốc tức thời của vật tại thời điểm đó.'
            ],
            finalAnswer: '|v_D| > |v_C| = |v_G| > |v_E| = |v_H| = 0 (Tại VTCB tốc độ cực đại, tại biên tốc độ bằng 0).',
            targetCompetencyGroup: 'Nhóm B',
            pedagogicalNote: 'Giúp học sinh liên hệ sâu sắc giữa khái niệm hình học (độ dốc tiếp tuyến mép thước) và ý nghĩa vật lí (vận tốc tức thời v = tan α).'
          },
          {
            id: 'b5_q3_p29_cong_van_toc',
            type: 'EXERCISE',
            title: 'Bài tập áp dụng cộng vận tốc (Trang 29)',
            page: 29,
            section: 'III. Tổng hợp vận tốc',
            prompt: '1. Một đoàn tàu đang chạy thẳng với vận tốc trung bình 36 km/h so với mặt đường. Một hành khách đi về cuối đoàn tàu với vận tốc 1 m/s so với sàn tàu. Hãy xác định vận tốc của hành khách đối với mặt đường.\n2. Một người bơi trong bể bơi có thể đạt 1 m/s. Nếu bơi xuôi dòng sông có dòng chảy 1 m/s thì đạt vận tốc tối đa bao nhiêu?\n3. Một ca nô chạy hết tốc lực trên mặt nước lặng đạt 21,5 km/h. Ca nô này chạy xuôi dòng sông trong 1 giờ rồi quay lại thì phải mất 2 giờ nữa mới về tới vị trí ban đầu. Hãy tính vận tốc chảy của dòng sông.',
            stepByStepSolution: [
              '**Bài 1:**',
              '• Chọn vật 1 là hành khách, vật 2 là tàu, vật 3 là mặt đường.',
              '• Vận tốc tàu với đường: $v_{23} = 36\\text{ km/h} = 10\\text{ m/s}$.',
              '• Vận tốc khách với tàu: $v_{12} = -1\\text{ m/s}$ (ngược chiều chuyển động của tàu).',
              '• Áp dụng công thức cộng vận tốc: $\\vec{v}_{13} = \\vec{v}_{12} + \\vec{v}_{23} \\Rightarrow v_{13} = 10 - 1 = 9\\text{ m/s} = 32,4\\text{ km/h}$ (cùng hướng tàu chạy).',
              '**Bài 2:**',
              '• Bơi xuôi dòng: $v = v_{người/nước} + v_{nước/bờ} = 1 + 1 = 2\\text{ m/s}$.',
              '**Bài 3:**',
              '• Gọi vận tốc dòng nước là $u$ ($u < 21,5\\text{ km/h}$).',
              '• Vận tốc xuôi dòng: $v_{xuôi} = 21,5 + u$. Quãng đường đi xuôi: $s = (21,5 + u) \\times 1$.',
              '• Vận tốc ngược dòng: $v_{ngược} = 21,5 - u$. Quãng đường đi ngược: $s = (21,5 - u) \\times 2$.',
              '• Vì quãng đường xuôi và ngược bằng nhau:',
              '$$(21,5 + u) \\times 1 = (21,5 - u) \\times 2 \\Leftrightarrow 21,5 + u = 43 - 2u \\Leftrightarrow 3u = 21,5 \\Rightarrow u = \\frac{21,5}{3} \\approx 7,17\\text{ km/h}$$'
            ],
            finalAnswer: '1) v = 9 m/s (32,4 km/h); 2) v_max = 2 m/s; 3) u ≈ 7,17 km/h.',
            targetCompetencyGroup: 'Nhóm C',
            errorWarning: 'Học sinh hay quên gán dấu âm khi hành khách đi ngược chiều tàu.'
          }
        ]
      },
      {
        lessonId: 6,
        chapterId: 2,
        lessonNumber: 6,
        lessonTitle: 'Thực hành: Đo tốc độ của vật chuyển động',
        pageRange: 'Trang 30 - 33',
        totalQuestions: 5,
        questions: [
          {
            id: 'b6_q1_p30_khoi_dong',
            type: 'IN_TEXT_QUESTION',
            title: 'Khởi động (Trang 30 - Đo tốc độ trong phòng thực hành)',
            page: 30,
            section: 'Khởi động',
            prompt: 'Làm thế nào để đo được tốc độ chuyển động của một vật (như xe con hoặc viên bi lăn trên máng) bằng các dụng cụ thí nghiệm trong phòng thực hành?',
            summary: 'Nguyên tắc cơ bản để đo tốc độ: Đo quãng đường s và đo khoảng thời gian t vật đi hết quãng đường đó.',
            formula: 'v = \\frac{s}{t}',
            stepByStepSolution: [
              '1. **Nguyên tắc vật lí:**',
              '• Tốc độ chuyển động được xác định thông qua phép đo gián tiếp dựa trên công thức định nghĩa: $v = \\frac{s}{t}$.',
              '• Do đó, để đo tốc độ ta cần thực hiện hai phép đo trực tiếp:',
              '  - **Đo quãng đường đi được $s$:** Bằng thước đo độ dài (thước thẳng milimét gắn trên máng hoặc thước cuộn).',
              '  - **Đo thời gian chuyển động $t$:** Bằng đồng hồ bấm giây cầm tay hoặc bằng cổng quang điện kết hợp đồng hồ đo thời gian hiện số.',
              '2. **Hai phương án thực hành cụ thể:**',
              '• **Phương án 1:** Dùng thước và đồng hồ bấm giây thủ công (đơn giản, dễ làm nhưng sai số phản xạ lớn).',
              '• **Phương án 2:** Dùng máng định hướng, cổng quang điện và đồng hồ hiện số kỹ thuật số (độ chính xác rất cao, đo được cả tốc độ trung bình và tốc độ tức thời).'
            ],
            finalAnswer: 'Đo quãng đường s bằng thước kẻ và đo thời gian t bằng đồng hồ bấm giây hoặc cổng quang điện kết hợp đồng hồ hiện số, sau đó tính v = s/t.',
            targetCompetencyGroup: 'Nhóm A',
            pedagogicalNote: 'Giáo viên hướng dẫn học sinh nhận biết đây là phép đo gián tiếp thông qua 2 đại lượng cơ bản s và t.'
          },
          {
            id: 'b6_q2_p30_dong_ho_bam_giay',
            type: 'ACTIVITY',
            title: 'Hoạt động 1 (Trang 30 - Đo tốc độ bằng đồng hồ bấm giây)',
            page: 30,
            section: 'I. Đo tốc độ bằng đồng hồ bấm giây thủ công',
            prompt: '1. Thảo luận để thiết kế phương án đo tốc độ của một xe đồ chơi chạy trên mặt bàn phẳng hoặc máng nghiêng bằng đồng hồ bấm giây.\n2. Nêu ưu điểm và nhược điểm của phương án này.',
            stepByStepSolution: [
              '**1. Thiết kế phương án thực nghiệm:**',
              '• **Dụng cụ:** Xe đồ chơi/xe lăn, thước đo chia milimét, đồng hồ bấm giây cầm tay, băng dính đánh dấu vạch.',
              '• **Các bước tiến hành:**',
              '  - Bước 1: Dùng thước đo khoảng cách giữa vạch xuất phát A và vạch đích B (ví dụ $s = 1{,}000\\text{ m}$).',
              '  - Bước 2: Đặt xe tại vạch A. Khi bắt đầu thả/bật xe chạy thì đồng thời bấm đồng hồ chạy.',
              '  - Bước 3: Quan sát xe đến khi chạm vạch B thì lập tức bấm dừng đồng hồ. Ghi lại thời gian $t$.',
              '  - Bước 4: Lặp lại phép đo 5 lần để tính giá trị thời gian trung bình $\\bar{t}$ và sai số $\\Delta t$.',
              '  - Bước 5: Tính tốc độ trung bình $v_{tb} = \\frac{s}{\\bar{t}}$.',
              '**2. Đánh giá ưu điểm và nhược điểm:**',
              '• **Ưu điểm:** Dụng cụ rất phổ biến, giá thành rẻ, quy trình đơn giản, có thể triển khai đo đạc ở mọi môi trường thực tế (sân trường, lớp học).',
              '• **Nhược điểm:** Sai số rất lớn (đặc biệt là sai số ngẫu nhiên do thời gian phản xạ thị giác - thao tác tay của người bấm khoảng $0{,}2\\text{ s} - 0{,}3\\text{ s}$). Không thể đo được tốc độ tức thời tại một điểm xác định.'
            ],
            finalAnswer: 'Ưu điểm: Dễ làm, dụng cụ phổ biến; Nhược điểm: Sai số phản xạ của con người lớn, không đo được tốc độ tức thời.',
            targetCompetencyGroup: 'Nhóm B',
            errorWarning: 'Học sinh bấm đồng hồ trước hoặc sau khi xe qua vạch do phản xạ không đồng bộ.'
          },
          {
            id: 'b6_q3_p31_cong_quang_dien',
            type: 'ACTIVITY',
            title: 'Hoạt động 2 (Trang 31 - Đo tốc độ bằng cổng quang điện & đồng hồ hiện số)',
            page: 31,
            section: 'II. Đo tốc độ bằng cổng quang điện và đồng hồ hiện số',
            prompt: '1. Tại sao sử dụng cổng quang điện kết hợp đồng hồ đo thời gian hiện số lại cho kết quả đo chính xác hơn nhiều so với đồng hồ bấm giây?\n2. Khi đo tốc độ tức thời của xe tại một vị trí, tại sao cần gắn tấm chắn sáng có bề rộng d nhỏ (khoảng 10 mm - 20 mm) trên xe?\n3. Nêu các bước cài đặt đồng hồ hiện số để đo thời gian chuyển động giữa 2 cổng quang điện A và B.',
            stepByStepSolution: [
              '**1. Lí do kết quả chính xác hơn:**',
              '• Cổng quang điện hoạt động bằng chùm tia hồng ngoại và tế bào quang điện. Việc bật/tắt đếm thời gian diễn ra hoàn toàn tự động bằng tín hiệu điện tử tức thời khi chùm sáng bị chắn hoặc phục hồi.',
              '• Loại bỏ triệt để sai số do thời gian phản xạ của người thao tác.',
              '• Đồng hồ hiện số có độ chính xác cao đến $0{,}001\\text{ s}$ (1 mili giây).',
              '**2. Lí do bề rộng d của tấm chắn sáng phải nhỏ:**',
              '• Tốc độ tức thời là giới hạn của tốc độ trung bình trong khoảng thời gian rất nhỏ: $v = \\lim_{\\Delta t \\to 0} \\frac{\\Delta s}{\\Delta t}$.',
              '• Khi tấm chắn sáng có bề rộng $d$ rất nhỏ ($d = 10\\text{ mm} = 0{,}01\\text{ m}$), thời gian chắn sáng $\\Delta t$ qua cổng là rất ngắn, chuyển động của xe trong khoảng thời gian $\\Delta t$ này được coi gần đúng là chuyển động thẳng đều.',
              '• Do đó: $v_{tức\\_thời} \\approx \\frac{d}{\\Delta t}$.',
              '**3. Các bước cài đặt đồng hồ đo thời gian hiện số để đo thời gian từ cổng A đến cổng B:**',
              '• Bước 1: Cắm giắc cảm biến cổng quang điện A vào ổ cắm A, cổng B vào ổ cắm B phía sau đồng hồ.',
              '• Bước 2: Chọn thang đo thời gian $9{,}999\\text{ s}$ (độ chia nhỏ nhất $0{,}001\\text{ s}$).',
              '• Bước 3: Gạt phím chọn chế độ hoạt động sang vị trí **MODE A ↔ B**.',
              '• Bước 4: Bấm phím **RESET** để màn hình hiển thị số $0{,}000\\text{ s}$.'
            ],
            finalAnswer: '1) Tự động hóa hoàn toàn bằng cảm biến quang học, loại trừ sai số phản xạ con người; 2) Bề rộng d nhỏ giúp khoảng thời gian Δt rất ngắn để v = d/Δt xấp xỉ chính xác tốc độ tức thời; 3) Chọn Mode A ↔ B, thang 9,999s, bấm Reset.',
            targetCompetencyGroup: 'Nhóm B',
            pedagogicalNote: 'Khắc sâu khái niệm vi phân thực nghiệm: chuyển động trong khoảng thời gian cực ngắn được coi là đều.'
          },
          {
            id: 'b6_q4_p32_bang_so_lieu_sai_so',
            type: 'EXERCISE',
            title: 'Hoạt động 3 (Trang 32 - Xử lí bảng số liệu & Tính sai số phép đo)',
            page: 32,
            section: 'III. Xử lí kết quả thí nghiệm và tính sai số',
            prompt: 'Một nhóm học sinh tiến hành thí nghiệm đo tốc độ của xe con trên máng nghiêng qua hai cổng quang điện A và B cách nhau quãng đường s = 0,600 m (dùng thước có ĐCNN là 1 mm). Kết quả đo thời gian qua 5 lần liên tiếp là: 0,845 s; 0,851 s; 0,848 s; 0,846 s; 0,850 s. Đồng hồ hiện số có ĐCNN 0,001 s.\na) Tính giá trị trung bình của thời gian chuyển động t̄ và tốc độ trung bình v̄.\nb) Tính sai số tuyệt đối của thời gian Δt và của quãng đường Δs.\nc) Tính sai số tỉ đối δv và sai số tuyệt đối Δv của tốc độ. Viết kết quả phép đo.',
            summary: '• Quãng đường: $s = 0{,}600\\text{ m}$; $\\Delta s_{dc} = 0{,}001\\text{ m}$\n• 5 lần đo thời gian $t_i$: 0,845; 0,851; 0,848; 0,846; 0,850 (s)\n• $\\Delta t_{dc} = 0{,}001\\text{ s}$',
            formula: '\\bar{v} = \\frac{\\bar{s}}{\\bar{t}}; \\quad \\delta v = \\frac{\\Delta s}{\\bar{s}} + \\frac{\\Delta t}{\\bar{t}}; \\quad \\Delta v = \\bar{v} . \\delta v',
            stepByStepSolution: [
              '**a) Tính giá trị trung bình của thời gian $\\bar{t}$ và tốc độ $\\bar{v}$:**',
              '• Thời gian trung bình:',
              '$$\\bar{t} = \\frac{0{,}845 + 0{,}851 + 0{,}848 + 0{,}846 + 0{,}850}{5} = \\frac{4{,}240}{5} = 0{,}848\\text{ s}$$',
              '• Tốc độ trung bình:',
              '$$\\bar{v} = \\frac{\\bar{s}}{\\bar{t}} = \\frac{0{,}600}{0{,}848} \\approx 0{,}70755\\text{ m/s} \\approx 0{,}708\\text{ m/s}$$',
              '**b) Tính sai số tuyệt đối $\\Delta t$ và $\\Delta s$:**',
              '• Sai số ngẫu nhiên từng lần đo thời gian: $|\\Delta t_1| = |0{,}845 - 0{,}848| = 0{,}003\\text{ s}$; $|\\Delta t_2| = 0{,}003\\text{ s}$; $|\\Delta t_3| = 0{,}000\\text{ s}$; $|\\Delta t_4| = 0{,}002\\text{ s}$; $|\\Delta t_5| = 0{,}002\\text{ s}$.',
              '• Sai số ngẫu nhiên trung bình: $\\overline{\\Delta t} = \\frac{0{,}003 + 0{,}003 + 0{,}000 + 0{,}002 + 0{,}002}{5} = 0{,}002\\text{ s}$.',
              '• Sai số dụng cụ: $\\Delta t_{dc} = 0{,}001\\text{ s}$.',
              '• Sai số tuyệt đối của thời gian: $\\Delta t = \\overline{\\Delta t} + \\Delta t_{dc} = 0{,}002 + 0{,}001 = 0{,}003\\text{ s}$.',
              '• Sai số tuyệt đối của quãng đường: $\\Delta s = \\Delta s_{dc} = 0{,}001\\text{ m} = 1\\text{ mm}$.',
              '**c) Tính sai số của tốc độ và viết kết quả:**',
              '• Sai số tỉ đối:',
              '$$\\delta v = \\delta s + \\delta t = \\frac{\\Delta s}{\\bar{s}} + \\frac{\\Delta t}{\\bar{t}} = \\frac{0{,}001}{0{,}600} + \\frac{0{,}003}{0{,}848} \\approx 0{,}00167 + 0{,}00354 = 0{,}00521 = 0{,}521\\%$$',
              '• Sai số tuyệt đối của tốc độ:',
              '$$\\Delta v = \\bar{v} \\times \\delta v = 0{,}70755 \\times 0{,}00521 \\approx 0{,}00368\\text{ m/s} \\approx 0{,}004\\text{ m/s}$$',
              '• **Biểu diễn kết quả phép đo tốc độ:**',
              '$$v = \\bar{v} \\pm \\Delta v = 0{,}708 \\pm 0{,}004\\text{ (m/s)}$$'
            ],
            finalAnswer: 'a) t̄ = 0,848 s; v̄ ≈ 0,708 m/s; b) Δt = 0,003 s; Δs = 0,001 m; c) δv ≈ 0,52%; Δv ≈ 0,004 m/s; Kết quả: v = 0,708 ± 0,004 (m/s).',
            targetCompetencyGroup: 'Nhóm C',
            errorWarning: 'Quên cộng sai số dụng cụ Δt_dc vào sai số ngẫu nhiên hoặc làm tròn sai số tuyệt đối không đồng nhất bậc thập phân với giá trị trung bình.'
          },
          {
            id: 'b6_q5_p33_em_co_the',
            type: 'EM_CO_THE',
            title: 'Em có thể (Trang 33 - Ứng dụng công nghệ đo tốc độ trong đời sống)',
            page: 33,
            section: 'Em có thể',
            prompt: '1. Sử dụng điện thoại thông minh (smartphone) để quay video chuyển động của một vật và dùng ứng dụng phân tích video để xác định tốc độ.\n2. Đề xuất phương án đo tốc độ của một học sinh chạy 100 m trong tiết Thể dục nhằm hạn chế tối đa sai số.',
            stepByStepSolution: [
              '**1. Ứng dụng điện thoại thông minh:**',
              '• Sử dụng chế độ quay video chuyển động chậm (**Slow-motion 120 fps hoặc 240 fps**) trên smartphone đặt vuông góc với hướng chuyển động.',
              '• Đặt một thước chuẩn (dài 1 m) trong khung hình làm tỉ xích chiều dài.',
              '• Sử dụng phần mềm phân tích video (như Tracker Video Analysis hoặc Vernier Video Physics) để chấm tọa độ vị trí của vật theo từng khung hình (mỗi khung hình ứng với $\\Delta t = \\frac{1}{240}\\text{ s} \\approx 0{,}00417\\text{ s}$).',
              '• Phần mềm tự động vẽ đồ thị $s - t$ và tính toán tốc độ tức thời, vận tốc và gia tốc với độ chính xác rất cao.',
              '**2. Phương án đo tốc độ chạy 100 m giảm thiểu sai số:**',
              '• Bố trí người bấm giờ ở vạch đích nhìn **khói/chớp lửa từ súng phát lệnh** (hoặc cờ hạ xuống của trọng tài xuất phát) để bấm giờ bắt đầu chạy, **không nghe tiếng súng** (vì tốc độ âm thanh trong không khí chỉ khoảng $340\\text{ m/s}$, truyền $100\\text{ m}$ mất khoảng $0{,}29\\text{ s}$ gây sai số lớn).',
              '• Dùng ít nhất 3 giám khảo bấm giờ độc lập tại vạch đích để lấy kết quả trung bình.',
              '• Hiện đại hơn: Sử dụng cổng cảm biến quang điện / laser hoặc camera Photo-Finish tại vạch đích nối với đồng hồ điện tử tự động kích hoạt bởi tiếng súng xuất phát.'
            ],
            finalAnswer: '1) Dùng video Slow-motion 240 fps kèm phần mềm Tracker phân tích khung hình; 2) Bấm giờ nhìn khói súng thay vì nghe tiếng nổ, lấy trung bình 3 đồng hồ hoặc dùng camera Photo-Finish.',
            targetCompetencyGroup: 'Nhóm D',
            pedagogicalNote: 'Liên hệ thực tế giữa kiến thức quang học (tốc độ ánh sáng c ≈ 3.10^8 m/s >> tốc độ âm thanh v_âm ≈ 340 m/s) với khảo thí thể thao.'
          }
        ]
      },
      {
        lessonId: 10,
        chapterId: 2,
        lessonNumber: 10,
        lessonTitle: 'Sự rơi tự do',
        pageRange: 'Trang 44 - 46',
        totalQuestions: 5,
        questions: [
          {
            id: 'b10_q1_p44_hinh10_2',
            type: 'ACTIVITY',
            title: 'Hoạt động mục II - Câu 1 (Trang 44 - Hình 10.2: Thí nghiệm đốt sợi chỉ & Dây dọi)',
            page: 44,
            section: 'II. Sự rơi tự do - Phương và chiều của sự rơi tự do',
            prompt: '1. Hãy thực hiện thí nghiệm (Hình 10.2) để kiểm tra dự đoán về phương và chiều của sự rơi tự do.',
            summary: 'Khung giá thí nghiệm có 2 vị trí treo: một dây chỉ buộc quả nặng và một sợi dây dọi. Dùng que diêm đốt đứt sợi chỉ và quan sát quỹ đạo rơi.',
            frameOfReference: 'Trục thẳng đứng Oy hướng từ trên xuống dưới, gốc O tại vị trí bắt đầu thả rơi của quả nặng.',
            formula: 's = \\frac{1}{2} g t^2; \\quad v = g t; \\quad \\vec{P} = m \\vec{g}',
            stepByStepSolution: [
              '1. **Bố trí thí nghiệm (Hình 10.2):**',
              '• Trên giá thí nghiệm thẳng đứng, gắn thanh ngang có hai móc treo:',
              '  - Móc 1: Buộc một sợi chỉ mảnh treo một quả nặng kim loại.',
              '  - Móc 2: Treo một sợi dây dọi buông thõng tự nhiên (dây dọi luôn chỉ chính xác phương thẳng đứng theo phương của trọng lực Trái Đất).',
              '2. **Tiến hành thí nghiệm:**',
              '• Dùng que diêm đang cháy đốt đứt sợi chỉ giữ quả nặng để quả nặng bắt đầu rơi tự do xuống dưới (vận tốc ban đầu $v_0 = 0$).',
              '• Quan sát quỹ đạo rơi của quả nặng đối chiếu với sợi dây dọi treo bên cạnh.',
              '3. **Hiện tượng quan sát được & Kết luận:**',
              '• Khi sợi chỉ đứt, quả nặng rơi theo một đường thẳng song song tuyệt đối và trùng với phương của sợi dây dọi.',
              '• **Kết luận:** Chuyển động rơi tự do có **phương thẳng đứng**, **chiều từ trên xuống dưới** (cùng phương và chiều với trọng lực $\\vec{P}$).'
            ],
            finalAnswer: 'Sự rơi tự do có PHƯƠNG THẲNG ĐỨNG, CHIỀU TỪ TRÊN XUỐNG DƯỚI (song song tuyệt đối với phương dây dọi).',
            pedagogicalNote: 'Dây dọi là chuẩn mực định vị phương thẳng đứng trong thực tiễn xây dựng và vật lí học.',
            targetCompetencyGroup: 'Nhóm A',
            interactiveKey: 'EXP_10_2'
          },
          {
            id: 'b10_q2_p44_tuong_dung',
            type: 'ACTIVITY',
            title: 'Hoạt động mục II - Câu 2 (Trang 44 - Kiểm tra bức tường thẳng đứng)',
            page: 44,
            section: 'II. Vận dụng đặc điểm phương của sự rơi tự do',
            prompt: '2. Dựa vào đặc điểm về phương của sự rơi tự do, hãy tìm cách kiểm tra bề mặt của bức tường trong lớp học có phải là mặt phẳng thẳng đứng không.',
            summary: 'Ứng dụng nguyên lí dây dọi (phương trọng lực thẳng đứng) để kiểm tra độ thẳng đứng của diện tích mặt phẳng tường.',
            stepByStepSolution: [
              '1. **Cơ sở lí thuyết:**',
              '• Một sợi dây mềm mang quả nặng (dây dọi) khi cân bằng luôn có phương thẳng đứng hoàn hảo trùng với phương rơi tự do của các vật.',
              '2. **Cách tiến hành kiểm tra bề mặt bức tường:**',
              '• **Bước 1:** Treo sợi dây dọi từ điểm cao nhất sát mép trên cùng của bức tường buông thõng tự nhiên xuống sát chân tường.',
              '• **Bước 2:** Chờ quả dọi đứng yên hoàn toàn. Dùng thước đo khoảng cách (vuông góc) từ sợi dây dọi đến bề mặt bức tường tại 3 vị trí khác nhau: ở đỉnh ($d_1$), ở giữa ($d_2$) và ở sát chân tường ($d_3$).',
              '• **Bước 3 (Đánh giá kết quả):**',
              '  - Nếu $d_1 = d_2 = d_3$ (khoảng cách tại mọi điểm đều không đổi và dây dọi song song với mặt tường): $\\implies$ **Bề mặt bức tường là mặt phẳng thẳng đứng hoàn hảo**.',
              '  - Nếu các khoảng cách $d_1, d_2, d_3$ khác nhau (hoặc dây chạm tường ở một điểm rồi hở ra ở điểm khác): $\\implies$ **Bức tường bị nghiêng hoặc bị lồi lõm, không phải mặt phẳng thẳng đứng**.'
            ],
            finalAnswer: 'Treo dây dọi sát mép trên của tường, đo khoảng cách từ dây dọi đến tường ở 3 điểm (trên, giữa, dưới). Nếu khoảng cách không đổi ($d_1 = d_2 = d_3$) thì tường là mặt phẳng thẳng đứng.',
            pedagogicalNote: 'Đây là phương pháp kinh điển của các kĩ sư xây dựng và thợ hồ từ hàng nghìn năm nay (dùng quả dọi thợ nề).',
            targetCompetencyGroup: 'Nhóm B',
            interactiveKey: 'WALL_CHECK'
          },
          {
            id: 'b10_q3_p45_eke_hinh10_3',
            type: 'ACTIVITY',
            title: 'Hoạt động mục II - Câu 3 (Trang 45 - Hình 10.3: Dùng Êke tam giác vuông cân & Dây dọi)',
            page: 45,
            section: 'II. Vận dụng kiểm tra mặt phẳng nằm ngang',
            prompt: '3. Hãy nghĩ cách dùng êke tam giác vuông cân (Hình 10.3) và dây dọi để kiểm tra xem sàn lớp mình có phẳng hay không.',
            summary: 'Sử dụng tính chất hình học của êke tam giác vuông cân (đường cao hạ từ đỉnh góc vuông cũng là đường trung trực, phân giác và vuông góc với cạnh huyền) kết hợp dây dọi thẳng đứng.',
            stepByStepSolution: [
              '1. **Cơ sở hình học & vật lí:**',
              '• Trong tam giác vuông cân $ABC$ ($A = 90^\\circ, AB = AC$), đường cao $AH$ hạ từ đỉnh góc vuông vuông góc với cạnh huyền $BC$ ($AH \\perp BC$).',
              '• Nếu cạnh huyền $BC$ nằm ngang thì đường cao $AH$ phải có **phương thẳng đứng**.',
              '• Sợi dây dọi treo tự do luôn luôn có phương thẳng đứng.',
              '2. **Cách tiến hành kiểm tra sàn lớp học:**',
              '• **Bước 1:** Chuẩn bị êke tam giác vuông cân có khắc sẵn vạch dấu đường cao (hoặc đường trung tuyến) hạ từ đỉnh góc vuông $A$ xuống trung điểm cạnh huyền $BC$.',
              '• **Bước 2:** Treo một sợi dây dọi có gắn quả nặng nhỏ từ đúng đỉnh góc vuông $A$ của êke.',
              '• **Bước 3:** Đặt cạnh huyền $BC$ của êke áp sát tiếp xúc hoàn toàn với mặt sàn lớp học tại vị trí cần kiểm tra.',
              '• **Bước 4 (Đọc kết quả):**',
              '  - Nếu sợi dây dọi **trùng khít với vạch dấu đường cao** khắc trên êke $\\implies$ Cạnh huyền $BC$ nằm ngang hoàn hảo $\\implies$ **Mặt sàn phẳng thăng bằng nằm ngang**.',
              '  - Nếu sợi dây dọi **bị lệch sang bên trái hoặc bên phải vạch dấu đường cao** $\\implies$ Cạnh huyền $BC$ bị nghiêng $\\implies$ **Mặt sàn bị dốc nghiêng không phẳng**.',
              '• **Bước 5:** Xoay êke theo các hướng vuông góc khác nhau trên mặt sàn để kiểm tra độ phẳng toàn diện của phòng học.'
            ],
            finalAnswer: 'Áp cạnh huyền BC của êke vào sàn nhà, treo dây dọi từ đỉnh góc vuông A. Nếu dây dọi trùng khít với vạch đường cao AH thì sàn phẳng nằm ngang; nếu lệch thì sàn bị nghiêng dốc.',
            pedagogicalNote: 'Nguyên lí này là tiền thân của thước nivô (thước thủy chuẩn / bọt nước) hiện đại.',
            targetCompetencyGroup: 'Nhóm B',
            interactiveKey: 'EKE_FLOOR'
          },
          {
            id: 'b10_q4_p46_cong_thuc',
            type: 'IN_TEXT_QUESTION',
            title: 'Câu hỏi mục III (Trang 46 - Công thức rơi tự do v và h)',
            page: 46,
            section: 'III. Công thức của chuyển động rơi tự do',
            prompt: '1. Hãy viết công thức tính vận tốc và quãng đường rơi tự do của một vật sau thời gian t khi thả rơi không vận tốc ban đầu.\n2. Từ độ cao 20 m so với mặt đất, một vật được thả rơi tự do. Lấy g = 9,8 m/s². Tính thời gian rơi và vận tốc của vật khi vừa chạm đất.',
            summary: '• Độ cao: $h = 20\\text{ m}$\n• Gia tốc trọng trường: $g = 9{,}8\\text{ m/s}^2$\n• Vận tốc đầu: $v_0 = 0\\text{ m/s}$',
            formula: 'v = g . t; \\quad s = \\frac{1}{2} g t^2; \\quad v^2 = 2 g s',
            stepByStepSolution: [
              '**1. Hệ thống công thức rơi tự do (với $v_0 = 0$):**',
              '• Vận tốc tức thời sau thời gian $t$: $v = g.t$',
              '• Quãng đường rơi sau thời gian $t$: $s = \\frac{1}{2} g t^2$',
              '• Công thức liên hệ độc lập thời gian giữa vận tốc và quãng đường: $v^2 = 2 g s \\implies v = \\sqrt{2 g s}$',
              '**2. Áp dụng tính toán:**',
              '• Thời gian rơi từ độ cao $h = 20\\text{ m}$ đến khi chạm đất ($s = h$):',
              '$$t = \\sqrt{\\frac{2h}{g}} = \\sqrt{\\frac{2 \\times 20}{9,8}} = \\sqrt{\\frac{40}{9,8}} \\approx 2,02\\text{ s}$$',
              '• Vận tốc của vật khi vừa chạm đất:',
              '$$v = \\sqrt{2 g h} = \\sqrt{2 \\times 9,8 \\times 20} = \\sqrt{392} \\approx 19,80\\text{ m/s}$$'
            ],
            finalAnswer: '1) v = g.t, s = 1/2 g.t²; 2) Thời gian rơi t ≈ 2,02 s; Vận tốc chạm đất v ≈ 19,80 m/s.',
            targetCompetencyGroup: 'Nhóm A'
          },
          {
            id: 'b10_q5_p46_bai_tap',
            type: 'EXERCISE',
            title: 'Bài tập 1 & 2 cuối bài (Trang 46 - Độ cao vách đá & Giây cuối cùng)',
            page: 46,
            section: 'Bài tập tự luyện rơi tự do',
            prompt: '1. Thả một hòn sỏi từ mép một vách đá cao xuống vực. Sau 2 s thì nghe thấy tiếng hòn sỏi chạm đáy. Bỏ qua thời gian truyền âm trong không khí, lấy g = 9,8 m/s². Tính độ cao của vách đá.\n2. Một vật rơi tự do từ độ cao h. Trong giây cuối cùng trước khi chạm đất, vật rơi được quãng đường 24,5 m. Lấy g = 9,8 m/s². Tính độ cao h và tổng thời gian rơi của vật.',
            summary: '• Bài 1: $t = 2\\text{ s}$, $g = 9{,}8\\text{ m/s}^2$\n• Bài 2: Quãng đường rơi trong giây cuối $\\Delta s = 24{,}5\\text{ m}$',
            formula: '\\Delta s = s(t) - s(t-1) = \\frac{1}{2} g t^2 - \\frac{1}{2} g (t-1)^2 = g \\left(t - \\frac{1}{2}\\right)',
            stepByStepSolution: [
              '**Bài 1 (Độ cao vách đá):**',
              '• Áp dụng công thức quãng đường rơi tự do sau thời gian $t = 2\\text{ s}$:',
              '$$h = \\frac{1}{2} g t^2 = \\frac{1}{2} \\times 9,8 \\times 2^2 = \\frac{1}{2} \\times 9,8 \\times 4 = 19,6\\text{ m}$$',
              '**Bài 2 (Rơi trong giây cuối cùng):**',
              '• Gọi tổng thời gian rơi của vật từ độ cao $h$ là $t$ (giây, với $t \\ge 1$).',
              '• Quãng đường rơi trong $t$ giây: $s_t = \\frac{1}{2} g t^2$.',
              '• Quãng đường rơi trong $(t - 1)$ giây đầu tiên: $s_{t-1} = \\frac{1}{2} g (t - 1)^2$.',
              '• Quãng đường vật đi được trong giây cuối cùng trước khi chạm đất:',
              '$$\\Delta s = s_t - s_{t-1} = \\frac{1}{2} g t^2 - \\frac{1}{2} g (t - 1)^2 = \\frac{1}{2} g [t^2 - (t^2 - 2t + 1)] = g \\left(t - \\frac{1}{2}\\right)$$',
              '• Thay số liệu $\\Delta s = 24,5\\text{ m}$ và $g = 9,8\\text{ m/s}^2$:',
              '$$24,5 = 9,8 \\left(t - \\frac{1}{2}\\right) \\implies t - 0,5 = \\frac{24,5}{9,8} = 2,5 \\implies t = 2,5 + 0,5 = 3,0\\text{ s}$$',
              '• Độ cao $h$ thả vật:',
              '$$h = \\frac{1}{2} g t^2 = \\frac{1}{2} \\times 9,8 \\times 3,0^2 = 0,5 \\times 9,8 \\times 9 = 44,1\\text{ m}$$'
            ],
            finalAnswer: 'Bài 1: Độ cao vách đá h = 19,6 m; Bài 2: Tổng thời gian rơi t = 3,0 s, Độ cao thả rơi h = 44,1 m.',
            targetCompetencyGroup: 'Nhóm C',
            errorWarning: 'Học sinh thường nhầm quãng đường trong giây thứ t với quãng đường sau t giây.'
          }
        ]
      }
    ]
  },
  {
    chapterId: 3,
    romanNumeral: 'III',
    chapterTitle: 'ĐỘNG LỰC HỌC',
    lessons: [
      {
        lessonId: 13,
        chapterId: 3,
        lessonNumber: 13,
        lessonTitle: 'Tổng hợp và phân tích lực. Cân bằng lực',
        pageRange: 'Trang 56 - 59',
        totalQuestions: 4,
        questions: [
          {
            id: 'b13_q1_p57',
            type: 'IN_TEXT_QUESTION',
            title: 'Câu hỏi mục I.2 (Trang 57 - Hai lực đồng quy F1 = 6N, F2 = 8N)',
            page: 57,
            section: 'I. Tổng hợp lực - Quy tắc hình bình hành',
            prompt: '1. Cho hai lực đồng quy có độ lớn $F_1 = 6\\text{ N}$ và $F_2 = 8\\text{ N}$. Nếu hợp lực có độ lớn $F = 10\\text{ N}$ thì góc giữa hai lực $F_1$ và $F_2$ bằng bao nhiêu? Vẽ hình minh hoạ.\n2. Hai tàu kéo cùng kéo một tàu chở hàng với lực kéo mỗi tàu là 8 000 N, góc giữa hai dây cáp là 30 độ. Tính độ lớn hợp lực kéo.',
            stepByStepSolution: [
              '**Ý 1:**',
              '• Nhận xét quan hệ độ lớn: $F_1^2 + F_2^2 = 6^2 + 8^2 = 36 + 64 = 100 = 10^2 = F^2$.',
              '• Theo định lí Pytago đảo, tam giác lực tạo bởi $\\vec{F}_1, \\vec{F}_2, \\vec{F}$ là tam giác vuông tại đỉnh tạo bởi 2 lực thành phần.',
              '• Do đó góc hợp bởi $\\vec{F}_1$ và $\\vec{F}_2$ là **$\\alpha = 90^\\circ$** (hai lực vuông góc với nhau).',
              '**Ý 2:**',
              '• Áp dụng công thức hợp lực hai lực bằng nhau: $F = 2 F_1 \\cos\\left(\\frac{\\alpha}{2}\\right)$ với $F_1 = F_2 = 8000\\text{ N}$, $\\alpha = 30^\\circ$.',
              '$$F = 2 \\times 8000 \\times \\cos(15^\\circ) = 16000 \\times 0,9659 \\approx 15454,8\\text{ N} \\approx 15455\\text{ N}$$'
            ],
            finalAnswer: '1) Góc $\\alpha = 90^\\circ$; 2) Hợp lực $F \\approx 15 455\\text{ N}$ hướng theo trục đối xứng giữa 2 tàu.',
            targetCompetencyGroup: 'Nhóm B'
          },
          {
            id: 'b13_q2_p58_can_bang',
            type: 'IN_TEXT_QUESTION',
            title: 'Câu hỏi mục II.1 (Trang 58 - Quyển sách trên bàn & Ô tô)',
            page: 58,
            section: 'II. Các lực cân bằng và không cân bằng',
            prompt: '1. Quan sát quyển sách đang nằm yên trên mặt bàn (Hình 13.5):\na) Có những lực nào tác dụng lên quyển sách?\nb) Các lực này có cân bằng không? Vì sao?\n2. Một ô tô chịu một lực $F_1 = 400\\text{ N}$ hướng về phía trước và một lực $F_2 = 300\\text{ N}$ hướng về phía sau. Hỏi hợp lực có độ lớn bao nhiêu và hướng về phía nào?',
            stepByStepSolution: [
              '**1. Quyển sách nằm yên:**',
              '• a) Quyển sách chịu tác dụng của 2 lực: **Trọng lực $\\vec{P}$** (hướng thẳng đứng từ trên xuống) và **Phản lực $\\vec{N}$ của mặt bàn** (hướng thẳng đứng từ dưới lên).',
              '• b) Hai lực này là **cặp lực cân bằng** vì cùng đặt vào quyển sách, cùng phương thẳng đứng, ngược chiều nhau và có độ lớn bằng nhau ($P = N$), làm quyển sách đứng yên.',
              '**2. Ô tô:**',
              '• Hợp lực tác dụng lên ô tô: $F = F_1 - F_2 = 400 - 300 = 100\\text{ N}$.',
              '• Hợp lực có độ lớn **$100\\text{ N}$** và có **hướng về phía trước** (cùng hướng với lực kéo lớn hơn $F_1$).'
            ],
            finalAnswer: 'Quyển sách chịu P và N cân bằng nhau; Ô tô chịu hợp lực 100 N hướng về phía trước.',
            targetCompetencyGroup: 'Nhóm A'
          },
          {
            id: 'b13_q3_p59_phan_tich',
            type: 'IN_TEXT_QUESTION',
            title: 'Câu hỏi mục III (Trang 59 - Vật trên mặt phẳng nghiêng)',
            page: 59,
            section: 'III. Phân tích lực',
            prompt: 'Một vật được giữ yên trên một mặt phẳng nghiêng nhẵn nhờ một lò xo (Hình 13.10).\n1. Có những lực nào tác dụng lên vật?\n2. Phân tích trọng lực tác dụng lên vật thành hai lực thành phần và nêu rõ tác dụng của hai lực này.',
            stepByStepSolution: [
              '**1. Các lực tác dụng lên vật:**',
              '• Trọng lực $\\vec{P}$ (hướng thẳng đứng xuống dưới).',
              '• Phản lực $\\vec{N}$ của mặt phẳng nghiêng (vuông góc với mặt nghiêng hướng lên).',
              '• Lực đàn hồi $\\vec{F}_{đh}$ của lò xo (hướng dọc theo trục lò xo lên trên).',
              '**2. Phân tích trọng lực $\\vec{P}$ thành 2 thành phần:**',
              '• Thành phần $\\vec{P}_x = \\vec{P}_{\\parallel}$ song song với mặt nghiêng ($P_x = P.\\sin\\alpha$): Có tác dụng kéo vật trượt xuống dốc, bị cân bằng bởi lực đàn hồi $\\vec{F}_{đh}$.',
              '• Thành phần $\\vec{P}_y = \\vec{P}_{\\perp}$ vuông góc với mặt nghiêng ($P_y = P.\\cos\\alpha$): Có tác dụng ép vật chặt vào mặt phẳng nghiêng, bị cân bằng bởi phản lực pháp tuyến $\\vec{N}$.'
            ],
            finalAnswer: 'Chịu 3 lực: P, N, Fđh; P được phân tích thành Px = P.sin(alpha) (kéo trượt dốc) và Py = P.cos(alpha) (ép vuông góc).',
            targetCompetencyGroup: 'Nhóm B'
          }
        ]
      },
      {
        lessonId: 15,
        chapterId: 3,
        lessonNumber: 15,
        lessonTitle: 'Định luật 2 Newton',
        pageRange: 'Trang 63 - 66',
        totalQuestions: 4,
        questions: [
          {
            id: 'b15_q1_p66',
            type: 'EXERCISE',
            title: 'Bài tập 2 & 3 cuối bài (Trang 66 - Lực đá bóng & Ô tô đồ chơi)',
            page: 66,
            section: 'Bài tập vận dụng Định luật 2 Newton',
            prompt: '2. Một quả bóng khối lượng 0,50 kg đang nằm yên trên mặt đất. Một cầu thủ đá bóng với một lực 250 N. Thời gian chân tác dụng vào bóng là 0,02 s. Quả bóng bay đi với tốc độ bao nhiêu?\n3. Dưới tác dụng của hợp lực 20 N, một chiếc xe đồ chơi chuyển động với gia tốc 0,4 m/s². Dưới tác dụng của hợp lực 50 N, chiếc xe sẽ chuyển động với gia tốc bao nhiêu?',
            stepByStepSolution: [
              '**Bài 2 (Đá bóng):**',
              '• Tóm tắt: $m = 0,50\\text{ kg}$, $v_0 = 0\\text{ m/s}$, $F = 250\\text{ N}$, $\\Delta t = 0,02\\text{ s}$.',
              '• Gia tốc quả bóng nhận được theo Định luật 2 Newton:',
              '$$a = \\frac{F}{m} = \\frac{250}{0,50} = 500\\text{ m/s}^2$$',
              '• Vận tốc bóng bay đi sau thời gian $\\Delta t$:',
              '$$v = v_0 + a.\\Delta t = 0 + 500 \\times 0,02 = 10,00\\text{ m/s}$$',
              '*(Chọn đáp án D. 10,00 m/s)*',
              '**Bài 3 (Xe đồ chơi):**',
              '• Khối lượng xe đồ chơi là hằng số:',
              '$$m = \\frac{F_1}{a_1} = \\frac{20}{0,4} = 50\\text{ kg}$$',
              '• Khi lực tác dụng là $F_2 = 50\\text{ N}$, gia tốc mới của xe là:',
              '$$a_2 = \\frac{F_2}{m} = \\frac{50}{50} = 1,0\\text{ m/s}^2$$'
            ],
            finalAnswer: 'Bài 2: $v = 10,00\\text{ m/s}$ (Đáp án D); Bài 3: $a_2 = 1,0\\text{ m/s}^2$.',
            targetCompetencyGroup: 'Nhóm B'
          }
        ]
      }
    ]
  },
  {
    chapterId: 4,
    romanNumeral: 'IV',
    chapterTitle: 'NĂNG LƯỢNG, CÔNG, CÔNG SUẤT',
    lessons: [
      {
        lessonId: 23,
        chapterId: 4,
        lessonNumber: 23,
        lessonTitle: 'Năng lượng. Công cơ học',
        pageRange: 'Trang 91 - 95',
        totalQuestions: 4,
        questions: [
          {
            id: 'b23_q1_p95_cong',
            type: 'EXERCISE',
            title: 'Bài tập 1 & 2 cuối bài (Trang 95)',
            page: 95,
            section: 'Bài tập tính công cơ học',
            prompt: '1. Trường hợp nào sau đây trọng lực tác dụng lên ô tô thực hiện công phát động, công cản và không thực hiện công?\na) Ô tô đang xuống dốc; b) Ô tô đang lên dốc; c) Ô tô chạy trên đường nằm ngang.\n2. Một người kéo một thùng hàng khối lượng 80 kg trượt trên sàn nhà bằng một sợi dây có phương hợp góc 30 độ so với phương ngang. Biết lực tác dụng lên dây bằng 150 N. Tính công của lực đó khi hòm trượt đi được 29 m.',
            summary: '• Khối lượng: $m = 80\\text{ kg}$\n• Lực kéo: $F = 150\\text{ N}$, góc kéo $\\alpha = 30^\\circ$\n• Quãng đường di chuyển: $s = 29\\text{ m}$',
            formula: 'A = F . s . cos(alpha)',
            stepByStepSolution: [
              '**Bài 1 (Trọng lực):**',
              '• a) Ô tô đang xuống dốc: Góc hợp bởi trọng lực $\\vec{P}$ và hướng chuyển động $\\alpha < 90^\\circ \\Rightarrow \\cos\\alpha > 0 \\Rightarrow$ Trọng lực sinh **công phát động** ($A > 0$).',
              '• b) Ô tô đang lên dốc: Góc $\\alpha > 90^\\circ \\Rightarrow \\cos\\alpha < 0 \\Rightarrow$ Trọng lực sinh **công cản** ($A < 0$).',
              '• c) Ô tô chạy trên đường ngang: Trọng lực $\\vec{P}$ vuông góc với độ dịch chuyển $\\vec{s}$ ($\\alpha = 90^\\circ \\Rightarrow \\cos 90^\\circ = 0) \\Rightarrow$ Trọng lực **không thực hiện công** ($A = 0$).',
              '**Bài 2 (Kéo thùng hàng):**',
              '• Áp dụng công thức tính công của lực không đổi:',
              '$$A = F \\times s \\times \\cos\\alpha$$',
              '• Thay số:',
              '$$A = 150 \\times 29 \\times \\cos(30^\\circ) = 4350 \\times \\frac{\\sqrt{3}}{2} \\approx 3767,2\\text{ J} \\approx 3,77\\text{ kJ}$$'
            ],
            finalAnswer: '1) a: Phát động, b: Cản, c: Không sinh công; 2) $A \\approx 3\\,767,2\\text{ J}$ ($3,77\\text{ kJ}$).',
            targetCompetencyGroup: 'Nhóm B',
            errorWarning: 'Học sinh hay tính nhầm khi máy tính để ở chế độ Radian thay vì Degree khi bấm cos(30°).'
          }
        ]
      },
      {
        lessonId: 26,
        chapterId: 4,
        lessonNumber: 26,
        lessonTitle: 'Cơ năng và định luật bảo toàn cơ năng',
        pageRange: 'Trang 102 - 105',
        totalQuestions: 3,
        questions: [
          {
            id: 'b26_q1_p105',
            type: 'EXERCISE',
            title: 'Bài tập 1 & 2 cuối bài (Trang 105)',
            page: 105,
            section: 'Bảo toàn cơ năng',
            prompt: '1. Một vật được thả cho rơi tự do từ độ cao $h = 10\\text{ m}$ so với mặt đất. Bỏ qua mọi ma sát. Ở độ cao nào thì vật có động năng bằng thế năng?\n2. Thả một vật có khối lượng $m = 0,5\\text{ kg}$ từ độ cao $h_1 = 0,8\\text{ m}$ so với mặt đất. Xác định động năng và thế năng của vật ở độ cao $h_2 = 0,6\\text{ m}$. Lấy $g = 9,8\\text{ m/s}^2$.',
            summary: 'Bài 1: $h = 10\\text{ m}$, $W_đ = W_t$. Bài 2: $m = 0,5\\text{ kg}$, $h_1 = 0,8\\text{ m}$, $h_2 = 0,6\\text{ m}$, $g = 9,8\\text{ m/s}^2$.',
            frameOfReference: 'Chọn mốc tính thế năng tại mặt đất (Wt = 0).',
            stepByStepSolution: [
              '**Bài 1:**',
              '• Cơ năng ban đầu tại vị trí thả rơi (vật ở độ cao $h$, vận tốc $v_0 = 0$):',
              '$$W = W_t + W_đ = m.g.h + 0 = m.g.h$$',
              '• Tại vị trí có động năng bằng thế năng ($W_đ = W_t$):',
              '$$W = W_t + W_đ = W_t + W_t = 2.W_t = 2.m.g.h\'$$',
              '• Áp dụng định luật bảo toàn cơ năng (bỏ qua sức cản không khí):',
              '$$m.g.h = 2.m.g.h\' \\Rightarrow h\' = \\frac{h}{2} = \\frac{10}{2} = 5\\text{ m}$$',
              '**Bài 2:**',
              '• Thế năng của vật ở độ cao $h_2 = 0,6\\text{ m}$:',
              '$$W_{t2} = m.g.h_2 = 0,5 \\times 9,8 \\times 0,6 = 2,94\\text{ J}$$',
              '• Cơ năng toàn phần ban đầu:',
              '$$W = m.g.h_1 = 0,5 \\times 9,8 \\times 0,8 = 3,92\\text{ J}$$',
              '• Động năng của vật ở độ cao $h_2$ theo định luật bảo toàn cơ năng:',
              '$$W_{đ2} = W - W_{t2} = 3,92 - 2,94 = 0,98\\text{ J}$$'
            ],
            finalAnswer: 'Bài 1: $h\' = 5\\text{ m}$; Bài 2: $W_{t2} = 2,94\\text{ J}, W_{đ2} = 0,98\\text{ J}$.',
          }
        ]
      }
    ]
  },
  {
    chapterId: 5,
    romanNumeral: 'V',
    chapterTitle: 'ĐỘNG LƯỢNG',
    lessons: [
      {
        lessonId: 28,
        chapterId: 5,
        lessonNumber: 28,
        lessonTitle: 'Động lượng',
        pageRange: 'Trang 110 - 112',
        totalQuestions: 4,
        questions: [
          {
            id: 'b28_q1_p111_tinh_p',
            type: 'EXERCISE',
            title: 'Bài tập 3 & 4 (Trang 111 - Tính độ lớn động lượng)',
            page: 111,
            section: 'Bài tập tính động lượng p = m.v',
            prompt: '3. Tính độ lớn động lượng trong các trường hợp sau:\na) Xe buýt khối lượng 3 tấn đang chuyển động với tốc độ 72 km/h.\nb) Hòn đá khối lượng 500 g chuyển động với tốc độ 10 m/s.\nc) Một electron khối lượng 9,1.10^-31 kg chuyển động với tốc độ 2.10^7 m/s.\n4. Một xe tải 1,5 tấn chạy 36 km/h và một ô tô 750 kg chạy ngược chiều với tốc độ 54 km/h. So sánh động lượng của hai xe.',
            formula: 'p = m . v',
            stepByStepSolution: [
              '**Bài 3:**',
              '• a) Xe buýt: $m = 3\\text{ tấn} = 3000\\text{ kg}$; $v = 72\\text{ km/h} = 20\\text{ m/s}$.',
              '$$p = m \\times v = 3000 \\times 20 = 60\\,000\\text{ kg.m/s} = 6.10^4\\text{ kg.m/s}$$',
              '• b) Hòn đá: $m = 500\\text{ g} = 0,5\\text{ kg}$; $v = 10\\text{ m/s}$.',
              '$$p = 0,5 \\times 10 = 5\\text{ kg.m/s}$$',
              '• c) Electron: $m = 9,1.10^{-31}\\text{ kg}$; $v = 2.10^7\\text{ m/s}$.',
              '$$p = 9,1.10^{-31} \\times 2.10^7 = 1,82.10^{-23}\\text{ kg.m/s}$$',
              '**Bài 4 (So sánh xe tải & ô tô):**',
              '• Xe tải: $m_1 = 1500\\text{ kg}$, $v_1 = 36\\text{ km/h} = 10\\text{ m/s} \\Rightarrow p_1 = 1500 \\times 10 = 15\\,000\\text{ kg.m/s}$.',
              '• Ô tô con: $m_2 = 750\\text{ kg}$, $v_2 = 54\\text{ km/h} = 15\\text{ m/s} \\Rightarrow p_2 = 750 \\times 15 = 11\\,250\\text{ kg.m/s}$.',
              '• So sánh: $p_1 > p_2$ (Độ lớn động lượng xe tải lớn hơn ô tô con: $15\\,000 > 11\\,250\\text{ kg.m/s}$). Về hướng, hai vectơ động lượng ngược chiều nhau.'
            ],
            finalAnswer: '3a) 60 000 kg.m/s; 3b) 5 kg.m/s; 3c) 1,82.10^-23 kg.m/s; 4) p_tải > p_con (15 000 > 11 250 kg.m/s).',
            targetCompetencyGroup: 'Nhóm A',
            errorWarning: 'Học sinh hay quên đổi tấn ra kg (1 tấn = 1000 kg) và km/h ra m/s.'
          }
        ]
      },
      {
        lessonId: 29,
        chapterId: 5,
        lessonNumber: 29,
        lessonTitle: 'Định luật bảo toàn động lượng',
        pageRange: 'Trang 113 - 115',
        totalQuestions: 3,
        questions: [
          {
            id: 'b29_q1_p115_va_cham',
            type: 'EXERCISE',
            title: 'Câu hỏi mục II.2 (Trang 114 - Va chạm mềm)',
            page: 114,
            section: 'II. Va chạm mềm',
            prompt: 'Dùng hai xe A và B giống nhau có cùng khối lượng m. Cho xe A chuyển động với vận tốc v đến va chạm với xe B đang đứng yên. Sau va chạm dính chặt vào nhau và cùng chuyển động với vận tốc v_AB. Hãy chứng minh v_AB = v / 2.',
            stepByStepSolution: [
              '1. **Xác định hệ kín:** Xét hệ hai xe A và B trên đệm khí (bỏ qua ma sát), đây là một hệ kín theo phương ngang.',
              '2. **Tổng động lượng trước va chạm:**',
              '• Xe A có khối lượng $m$, vận tốc $\\vec{v}$. Động lượng $\\vec{p}_A = m.\\vec{v}$.',
              '• Xe B có khối lượng $m$, vận tốc $v_B = 0$. Động lượng $\\vec{p}_B = \\vec{0}$.',
              '$$\\vec{p}_{trước} = \\vec{p}_A + \\vec{p}_B = m.\\vec{v}$$',
              '3. **Tổng động lượng sau va chạm (va chạm mềm):**',
              '• Sau va chạm, hai xe dính vào nhau có tổng khối lượng $M = m + m = 2m$ và cùng chuyển động với vận tốc $\\vec{v}_{AB}$.',
              '$$\\vec{p}_{sau} = (m + m).\\vec{v}_{AB} = 2m.\\vec{v}_{AB}$$',
              '4. **Áp dụng Định luật bảo toàn động lượng:**',
              '$$\\vec{p}_{trước} = \\vec{p}_{sau} \\Leftrightarrow m.\\vec{v} = 2m.\\vec{v}_{AB} \\Rightarrow \\vec{v}_{AB} = \\frac{\\vec{v}}{2}$$',
              '• Độ lớn vận tốc sau va chạm: $v_{AB} = \\frac{v}{2}$ (ĐPCM).'
            ],
            finalAnswer: 'Vận tốc sau va chạm mềm v_AB = v / 2 (giảm đi một nửa so với ban đầu).',
            targetCompetencyGroup: 'Nhóm B'
          }
        ]
      }
    ]
  },
  {
    chapterId: 6,
    romanNumeral: 'VI',
    chapterTitle: 'CHUYỂN ĐỘNG TRÒN',
    lessons: [
      {
        lessonId: 31,
        chapterId: 6,
        lessonNumber: 31,
        lessonTitle: 'Động học của chuyển động tròn đều',
        pageRange: 'Trang 120 - 122',
        totalQuestions: 4,
        questions: [
          {
            id: 'b31_q1_p121_kim_dong_ho',
            type: 'EXERCISE',
            title: 'Câu hỏi mục II (Trang 121 - Tốc độ góc kim giờ & kim phút)',
            page: 121,
            section: 'II. Tốc độ góc',
            prompt: '1. Hãy tính tốc độ góc của kim giờ và kim phút của đồng hồ.\n2. Biết chiều dài kim phút và kim giây của một chiếc đồng hồ lần lượt là 4 cm và 5 cm. Hãy tính:\na) Tỉ số chu kì quay của hai kim.\nb) Tỉ số tốc độ dài của đầu kim phút và đầu kim giây.',
            stepByStepSolution: [
              '**1. Tốc độ góc kim giờ và kim phút:**',
              '• Kim phút quay 1 vòng ($2\\pi\\text{ rad}$) hết 1 giờ ($3600\\text{ s}$):',
              '$$\\omega_{phút} = \\frac{2\\pi}{T_{phút}} = \\frac{2\\pi}{3600} = \\frac{\\pi}{1800} \\approx 1,745.10^{-3}\\text{ rad/s}$$',
              '• Kim giờ quay 1 vòng ($2\\pi\\text{ rad}$) hết 12 giờ ($12 \\times 3600 = 43200\\text{ s}$):',
              '$$\\omega_{giờ} = \\frac{2\\pi}{T_{giờ}} = \\frac{2\\pi}{43200} = \\frac{\\pi}{21600} \\approx 1,454.10^{-4}\\text{ rad/s}$$',
              '**2. So sánh kim phút (4 cm) và kim giây (5 cm):**',
              '• Chu kì: Kim phút $T_p = 3600\\text{ s}$, Kim giây $T_g = 60\\text{ s}$.',
              '• a) Tỉ số chu kì: $\\frac{T_p}{T_g} = \\frac{3600}{60} = 60$ (chu kì kim phút gấp 60 lần kim giây).',
              '• b) Tốc độ dài đầu kim: $v = \\omega.r = \\frac{2\\pi}{T}.r$.',
              '$$\\frac{v_p}{v_g} = \\frac{r_p / T_p}{r_g / T_g} = \\frac{r_p}{r_g} \\times \\frac{T_g}{T_p} = \\frac{4}{5} \\times \\frac{1}{60} = \\frac{4}{300} = \\frac{1}{75}$$',
              '• Vậy tốc độ đầu kim giây nhanh gấp 75 lần đầu kim phút!'
            ],
            finalAnswer: '1) omega_phút ≈ 1,75.10^-3 rad/s; omega_giờ ≈ 1,45.10^-4 rad/s; 2a) Tp/Tg = 60; 2b) vp/vg = 1/75.',
            targetCompetencyGroup: 'Nhóm C'
          }
        ]
      },
      {
        lessonId: 32,
        chapterId: 6,
        lessonNumber: 32,
        lessonTitle: 'Lực hướng tâm và gia tốc hướng tâm',
        pageRange: 'Trang 123 - 126',
        totalQuestions: 4,
        questions: [
          {
            id: 'b32_q1_p124_ve_tinh',
            type: 'EXERCISE',
            title: 'Câu hỏi mục II (Trang 124 - Gia tốc hướng tâm vệ tinh)',
            page: 124,
            section: 'II. Gia tốc hướng tâm',
            prompt: '1. Tính gia tốc hướng tâm của một vệ tinh nhân tạo chuyển động tròn đều quanh Trái Đất với bán kính quỹ đạo là 7 000 km và tốc độ 7,57 km/s.\n2. Kim phút của một chiếc đồng hồ dài 8 cm. Tính gia tốc hướng tâm của đầu kim.',
            formula: 'a_ht = v^2 / r = omega^2 . r',
            stepByStepSolution: [
              '**1. Vệ tinh nhân tạo:**',
              '• Đổi đơn vị: $r = 7\\,000\\text{ km} = 7.10^6\\text{ m}$; $v = 7,57\\text{ km/s} = 7570\\text{ m/s}$.',
              '• Gia tốc hướng tâm:',
              '$$a_{ht} = \\frac{v^2}{r} = \\frac{7570^2}{7.10^6} = \\frac{57304900}{7.10^6} \\approx 8,186\\text{ m/s}^2 \\approx 8,19\\text{ m/s}^2$$',
              '**2. Đầu kim phút đồng hồ:**',
              '• Bán kính: $r = 8\\text{ cm} = 0,08\\text{ m}$.',
              '• Tốc độ góc: $\\omega = \\frac{2\\pi}{3600} = \\frac{\\pi}{1800}\\text{ rad/s}$.',
              '• Gia tốc hướng tâm:',
              '$$a_{ht} = \\omega^2 \\times r = \\left(\\frac{\\pi}{1800}\\right)^2 \\times 0,08 \\approx 2,43.10^{-7}\\text{ m/s}^2$$'
            ],
            finalAnswer: '1) a_ht ≈ 8,19 m/s²; 2) a_ht ≈ 2,43.10^-7 m/s².',
            targetCompetencyGroup: 'Nhóm B',
            errorWarning: 'Học sinh rất hay quên đổi km ra m (nhân 1000) và cm ra m (chia 100).'
          }
        ]
      }
    ]
  },
  {
    chapterId: 7,
    romanNumeral: 'VII',
    chapterTitle: 'BIẾN DẠNG CỦA VẬT RẮN. ÁP SUẤT CHẤT LỎNG',
    lessons: [
      {
        lessonId: 33,
        chapterId: 7,
        lessonNumber: 33,
        lessonTitle: 'Biến dạng của vật rắn',
        pageRange: 'Trang 128 - 130',
        totalQuestions: 4,
        questions: [
          {
            id: 'b33_q1_p130_lo_xo',
            type: 'EXERCISE',
            title: 'Bài tập ví dụ (Trang 130 - Định luật Hooke)',
            page: 130,
            section: 'II. Định luật Hooke',
            prompt: 'Một lò xo bố trí theo phương thẳng đứng và có gắn vật nặng khối lượng 200 g. Khi vật treo ở dưới thì lò xo dài 17 cm, khi vật đặt ở trên thì lò xo dài 13 cm. Lấy g = 10 m/s² và bỏ qua trọng lượng của móc treo. Tính độ cứng k và chiều dài tự nhiên l0 của lò xo.',
            summary: '• Khối lượng: $m = 200\\text{ g} = 0{,}2\\text{ kg}$\n• Chiều dài khi dãn: $l_1 = 17\\text{ cm} = 0{,}17\\text{ m}$\n• Chiều dài khi nén: $l_2 = 13\\text{ cm} = 0{,}13\\text{ m}$\n• Gia tốc trọng trường: $g = 10\\text{ m/s}^2$',
            formula: 'F_dh = k . |Delta l| = m . g',
            stepByStepSolution: [
              '1. **Trọng lượng của vật nặng:**',
              '$$P = m.g = 0,2 \\times 10 = 2\\text{ N}$$',
              '2. **Khi vật treo ở dưới (lò xo bị dãn):**',
              '• Chiều dài lò xo: $l_1 = l_0 + \\Delta l_1 = 17\\text{ cm}$.',
              '• Lực đàn hồi cân bằng trọng lực: $F_{đh1} = k.\\Delta l_1 = k.(0,17 - l_0) = 2\\text{ N}$ (1)',
              '3. **Khi vật đặt ở trên (lò xo bị nén):**',
              '• Chiều dài lò xo: $l_2 = l_0 - \\Delta l_2 = 13\\text{ cm}$.',
              '• Lực đàn hồi cân bằng trọng lực: $F_{đh2} = k.\\Delta l_2 = k.(l_0 - 0,13) = 2\\text{ N}$ (2)',
              '4. **Giải hệ phương trình (1) và (2):**',
              '• Từ (1) và (2) suy ra: $0,17 - l_0 = l_0 - 0,13 \\Rightarrow 2.l_0 = 0,30 \\Rightarrow l_0 = 0,15\\text{ m} = 15\\text{ cm}$.',
              '• Độ biến dạng ở mỗi trường hợp: $\\Delta l = 17 - 15 = 2\\text{ cm} = 0,02\\text{ m}$.',
              '• Độ cứng $k$ của lò xo:',
              '$$k = \\frac{P}{\\Delta l} = \\frac{2}{0,02} = 100\\text{ N/m}$$'
            ],
            finalAnswer: 'Chiều dài tự nhiên l0 = 15 cm (0,15 m); Độ cứng k = 100 N/m.',
            targetCompetencyGroup: 'Nhóm B'
          }
        ]
      },
      {
        lessonId: 34,
        chapterId: 7,
        lessonNumber: 34,
        lessonTitle: 'Khối lượng riêng. Áp suất chất lỏng',
        pageRange: 'Trang 131 - 135',
        totalQuestions: 5,
        questions: [
          {
            id: 'b34_q1_p131_hop_kim',
            type: 'EXERCISE',
            title: 'Câu hỏi mục I (Trang 131 - Hợp kim đồng và bạc)',
            page: 131,
            section: 'I. Khối lượng riêng',
            prompt: 'Một hợp kim đồng và bạc có khối lượng riêng là 10,3 g/cm³. Tính khối lượng của bạc và đồng có trong 100 g hợp kim. Biết khối lượng riêng của đồng là 8,9 g/cm³, của bạc là 10,4 g/cm³.',
            summary: '• Khối lượng hợp kim: $m_{\\text{hk}} = 100\\text{ g}$\n• Khối lượng riêng hợp kim: $\\rho_{\\text{hk}} = 10{,}3\\text{ g/cm}^3$\n• Khối lượng riêng đồng: $\\rho_{\\text{Cu}} = 8{,}9\\text{ g/cm}^3$\n• Khối lượng riêng bạc: $\\rho_{\\text{Ag}} = 10{,}4\\text{ g/cm}^3$',
            stepByStepSolution: [
              '1. **Gọi ẩn số:** Gọi khối lượng của đồng là $m_1$ (g), khối lượng của bạc là $m_2$ (g).',
              '• Tổng khối lượng: $m_1 + m_2 = 100\\text{ g} \\Rightarrow m_1 = 100 - m_2$ (1)',
              '2. **Phương trình thể tích:**',
              '• Thể tích hợp kim bằng tổng thể tích của đồng và bạc:',
              '$$V_{hk} = V_1 + V_2 \\Leftrightarrow \\frac{m_{hk}}{\\rho_{hk}} = \\frac{m_1}{\\rho_1} + \\frac{m_2}{\\rho_2}$$',
              '• Thay số liệu:',
              '$$\\frac{100}{10,3} = \\frac{100 - m_2}{8,9} + \\frac{m_2}{10,4}$$',
              '$$9,7087 = \\frac{100}{8,9} - m_2 \\left(\\frac{1}{8,9} - \\frac{1}{10,4}\\right)$$',
              '$$9,7087 = 11,2360 - m_2 (0,11236 - 0,09615)$$',
              '$$0,01621 \\times m_2 = 1,5273 \\Rightarrow m_2 = \\frac{1,5273}{0,01621} \\approx 94,22\\text{ g}$$',
              '3. **Khối lượng của đồng:**',
              '$$m_1 = 100 - 94,22 = 5,78\\text{ g}$$'
            ],
            finalAnswer: 'Khối lượng Bạc (Ag) ≈ 94,22 g; Khối lượng Đồng (Cu) ≈ 5,78 g.',
            targetCompetencyGroup: 'Nhóm C'
          },
          {
            id: 'b34_q2_p134_ap_suat',
            type: 'IN_TEXT_QUESTION',
            title: 'Câu hỏi mục III (Trang 134 - Áp suất chất lỏng đáy bình)',
            page: 134,
            section: 'III. Áp suất của chất lỏng',
            prompt: 'Một khối chất lỏng đứng yên có khối lượng riêng rho, hình trụ diện tích đáy S, chiều cao h. Hãy dùng công thức tính áp suất p = F/S để chứng minh rằng áp suất của khối chất lỏng tác dụng lên đáy bình có độ lớn là p = rho . g . h.',
            stepByStepSolution: [
              '1. **Thể tích của khối chất lỏng hình trụ:**',
              '$$V = S \\times h$$',
              '2. **Khối lượng của khối chất lỏng:**',
              '$$m = \\rho \\times V = \\rho \\times S \\times h$$',
              '3. **Áp lực do khối chất lỏng tác dụng vuông góc lên đáy bình chính bằng trọng lượng $P$ của nó:**',
              '$$F = P = m \\times g = \\rho \\times g \\times S \\times h$$',
              '4. **Áp suất chất lỏng tại đáy bình:**',
              '$$p = \\frac{F}{S} = \\frac{\\rho \\times g \\times S \\times h}{S} = \\rho \\times g \\times h$$',
              '• Ta có ĐPCM: $p = \\rho.g.h$.'
            ],
            finalAnswer: 'Đã chứng minh áp suất chất lỏng tại độ sâu h là p = rho . g . h.',
            targetCompetencyGroup: 'Nhóm B'
          }
        ]
      }
    ]
  }
];

export function getSgkSolutionsForLesson(lessonId: number): SgkLessonSolutions | null {
  for (const chapter of SGK_SOLUTIONS_DATA) {
    const found = chapter.lessons.find((l) => l.lessonId === lessonId || l.lessonNumber === lessonId);
    if (found) return found;
  }
  return null;
}
