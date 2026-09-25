# Content coverage

Theo dõi nội dung Wordsly Path đã soạn. Cập nhật khi thêm hoặc sửa unit. Khung lộ trình và phương pháp: `../../../docs/wordsly-path/DESIGN.md` §4.

Trạng thái: `draft` đã soạn, qua validator · `reviewed` đã có người đọc lại · `published` đã có trong một release trên môi trường thật.

## Tổng quan

| Stage | Unit dự kiến | Đã soạn | Bài | Item | LEXICAL | PHRASE | PATTERN | GRAMMAR |
|---|---|---|---|---|---|---|---|---|
| Pre-A1 | 6 | 6 | 18 | 128 | 86 | 28 | 10 | 4 |
| A1 | 10 | 0 | | | | | | |

## Pre-A1: Foundations

| # | Unit | Can-do (tóm tắt) | Bài | Item (L/Ph/Pa/G) | Dialogue | Trạng thái |
|---|---|---|---|---|---|---|
| 1 | `pre-a1-01-hello` | chào, tạm biệt, chào theo buổi, nói tên, hỏi thăm | 3 | 16 (4/11/1/0) | 2 | draft |
| 2 | `pre-a1-02-alphabet` | tên chữ cái, đánh vần họ tên, hỏi cách đánh vần | 3 | 20 (18/1/1/0) | 1 | draft |
| 3 | `pre-a1-03-numbers` | số 0–100, tuổi, số điện thoại | 3 | 26 (22/2/1/1) | 1 | draft |
| 4 | `pre-a1-04-about-me` | đại từ + be, quê quán, nơi sống, nghề nghiệp | 3 | 23 (16/2/3/2) | 2 | draft |
| 5 | `pre-a1-05-classroom` | đồ vật, What's this?, số nhiều -s, câu lệnh | 3 | 25 (19/3/2/1) | 2 | draft |
| 6 | `pre-a1-06-help` | chiến lược: xin nhắc lại, hỏi nghĩa, hỏi cách nói, xác nhận | 3 | 18 (7/9/2/0) | 2 | draft |

### Mẫu câu (PATTERN)

| Item | Template | Unit |
|---|---|---|
| `my-name-is` | My name is {name}. | 01 |
| `how-do-you-spell` | How do you spell {word}? | 02 |
| `im-years-old` | I'm {age} years old. | 03 |
| `im-from` | I'm from {place}. | 04 |
| `i-live-in` | I live in {place}. | 04 |
| `im-a-job` | I'm {job}. (a/an + nghề) | 04 |
| `this-is-a` | This is a {thing}. | 05 |
| `its-a` | It's a {thing}. | 05 |
| `how-do-you-say` | How do you say {word} in English? | 06 |
| `what-does-mean` | What does {word} mean? | 06 |

### Ngữ pháp (GRAMMAR)

| Item | Điểm ngữ pháp | Unit |
|---|---|---|
| `teen-and-ty` | số 13–19 (-teen) và số tròn chục (-ty), số ghép có gạch nối | 03 |
| `be-present` | am / is / are, dạng rút gọn | 04 |
| `a-an` | mạo từ a / an, nghề nghiệp cần a/an | 04 |
| `plural-s` | số nhiều -s, cách đọc /s/ /z/ /ɪz/ | 05 |

### Phát âm và lỗi thường gặp của người Việt (đã đưa vào `noteVi` / EXPLAIN)

- Âm cuối: five, six, eight, book, desk, bag, twelve, live, please (unit 03, 05).
- /θ/ và /ð/: thank you, three, thirteen, thirty, they, this, that (unit 01, 03, 04, 05).
- -s số nhiều: unit 05 (`plural-s`).
- Tên chữ cái dễ nhầm: A/E/I, G/J, H, R, W, Y (unit 02).
- Chữ câm: two, eight, listen, write, know (unit 03, 05, 06).
- Dịch word-by-word: "I have 20 years old", "I'm come from", "I'm live in", "I'm student", "What is … mean?", "Good night" khi mới gặp.

### Còn thiếu hoặc để sau

- Chưa có `audioUrl`: câu và từ dùng TTS; IPA từ đơn sẽ lấy qua dictionary khi có admin UI (DESIGN §4).
- Chưa có bài ôn tổng hợp sau 4 unit và bài kiểm tra cuối stage (sẽ thêm cùng checkpoint ở P2).
- Số 14, 16–19, 60–90 chỉ xuất hiện trong phần giải thích `teen-and-ty`, chưa có item riêng.
