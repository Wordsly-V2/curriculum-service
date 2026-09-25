# Content coverage

Theo dõi nội dung Wordsly Path đã soạn. Cập nhật khi thêm hoặc sửa unit. Khung lộ trình và phương pháp: `../../../docs/wordsly-path/DESIGN.md` §4.

Trạng thái: `draft` đã soạn, qua validator · `reviewed` đã có người đọc lại · `published` đã có trong một release trên môi trường thật.

## Tổng quan

| Stage | Unit dự kiến | Đã soạn | Bài | Item | LEXICAL | PHRASE | PATTERN | GRAMMAR |
|---|---|---|---|---|---|---|---|---|
| Pre-A1 | 6 | 6 | 18 | 128 | 86 | 28 | 10 | 4 |
| A1 | 10 | 6 | 19 | 160 | 108 | 25 | 19 | 8 |

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

### Còn thiếu hoặc để sau (Pre-A1)

- Chưa có `audioUrl`: câu và từ dùng TTS; IPA từ đơn sẽ lấy qua dictionary khi có admin UI (DESIGN §4).
- Chưa có bài ôn tổng hợp sau 4 unit và bài kiểm tra cuối stage (sẽ thêm cùng checkpoint ở P2).
- Số 14, 16–19, 60–90 chỉ xuất hiện trong phần giải thích `teen-and-ty`, chưa có item riêng.

## A1: Beginner

| # | Unit | Can-do (tóm tắt) | Bài | Item (L/Ph/Pa/G) | Dialogue | Trạng thái |
|---|---|---|---|---|---|---|
| 1 | `a1-01-family` | thành viên gia đình, my/his/her…, anh chị em (older/younger) | 3 | 21 (15/3/2/1) | 2 | draft |
| 2 | `a1-02-daily-routine` | việc hằng ngày, hiện tại đơn (cả he/she + -s), giờ, trạng từ tần suất | 3 | 22 (6/11/3/2) | 2 | draft |
| 3 | `a1-03-food-and-drink` | món ăn, đồ uống, gọi món lịch sự, thích/không thích | 3 | 24 (18/1/5/0) | 2 | draft |
| 4 | `a1-04-shopping` | màu sắc, this/these/that/those, hỏi giá (How much is/are…?), đọc giá tiền, trả tiền | 3 | 27 (20/4/2/1) | 2 | draft |
| 5 | `a1-05-home` | phòng và đồ đạc, There is / There are, Is there…?, giới từ nơi chốn, Where's my…? | 3 | 27 (18/3/4/2) | 2 | draft |
| 6 | `a1-06-days-and-dates` | thứ, tháng, số thứ tự và ngày, sinh nhật, at/on/in với thời gian, hẹn gặp | 4 | 39 (31/3/3/2) | 2 | draft |
| 7 | `a1-07-right-now` | hiện tại tiếp diễn, phân biệt với hiện tại đơn, điện thoại | | | | chưa soạn |
| 8 | `a1-08-weather-and-clothes` | thời tiết, quần áo, tính từ cơ bản | | | | chưa soạn |
| 9 | `a1-09-directions` | địa điểm trong thành phố, hỏi và chỉ đường, câu mệnh lệnh | | | | chưa soạn |
| 10 | `a1-10-say-it-another-way` | chiến lược: "It's a kind of…", "the thing you use to…", câu đệm, tự sửa lỗi | | | | chưa soạn |

### Mẫu câu (PATTERN)

| Item | Template | Unit |
|---|---|---|
| `this-is-my` | This is my {person}. | 01 |
| `i-have` | I have {things}. | 01 |
| `its-time` | It's {time}. | 02 |
| `i-do-at` | I {activity} at {time}. | 02 |
| `what-time-do-you` | What time do you {activity}? | 02 |
| `id-like` | I'd like {thing}, please. | 03 |
| `can-i-have` | Can I have {thing}, please? | 03 |
| `i-like` | I like {thing}. | 03 |
| `i-dont-like` | I don't like {thing}. | 03 |
| `do-you-like` | Do you like {thing}? | 03 |
| `how-much-is` | How much is {thing}? | 04 |
| `how-much-are` | How much are {things}? | 04 |
| `there-is` | There's {thing} in the {room}. | 05 |
| `there-are` | There are {things} in the {room}. | 05 |
| `is-there-a` | Is there {thing} in the {room}? | 05 |
| `where-is` | Where's my {thing}? | 05 |
| `are-you-free-on` | Are you free on {day}? | 06 |
| `lets-meet` | Let's meet {when}. | 06 |
| `see-you-on` | See you on {day}! | 06 |

### Ngữ pháp (GRAMMAR)

| Item | Điểm ngữ pháp | Unit |
|---|---|---|
| `possessive-adjectives` | my, your, his, her, our, their | 01 |
| `present-simple` | hiện tại đơn với I/you/we/they, don't, Do…? | 02 |
| `present-simple-s` | he/she/it + -s/-es/-ies, doesn't, Does…?, has | 02 |
| `this-that-these-those` | this/these (gần), that/those (xa), is/are theo số | 04 |
| `there-is-there-are` | có: there is/are, isn't/aren't, Is there…?, trả lời ngắn | 05 |
| `prepositions-of-place` | in, on, under, next to, behind, in front of | 05 |
| `ordinal-numbers` | số thứ tự 1st–31st, đọc ngày kiểu Mỹ (May 5th) | 06 |
| `prepositions-of-time` | at + giờ, on + thứ/ngày, in + tháng/năm/buổi, không giới từ trước today/tomorrow | 06 |

### Lỗi thường gặp của người Việt (A1)

- Không phân biệt anh/em: brother/sister + older/younger (unit 01).
- his/her chọn theo người sở hữu (unit 01).
- "I'm get up", "I not like", quên -s với he/she, "doesn't gets" (unit 02, 03).
- "go to home", "Now is seven o'clock", "in six o'clock" (unit 02).
- "a rice", "I want…" / "Give me…" khi gọi món, "I have hungry", "Yes, I like" (unit 03).
- Chưa có item riêng: unit 01 dạy "has" chỉ qua EXPLAIN (sẽ đi cùng `present-simple-s` ở unit 02).
- "xanh" là blue hay green; màu đứng sau danh từ ("a bag red"); "this pens", "These is"; "fifty thousands" (unit 04).
- Dịch "có" thành have ("In my room have a bed"); "There is two chairs"; quên be trước giới từ ("The keys on the table"); "in home", "go to home" (unit 05).
- Đếm tháng bằng số ("month five"); đọc ngày bằng số đếm ("May five"); Tuesday và Thursday; "in Monday", "on tomorrow"; cách viết ngày kiểu Mỹ 7/5 (unit 06).

### Ghi chú A1

- Unit 06 có 4 bài (7 thứ, 12 tháng và số thứ tự không vừa 3 bài với 6–10 item mới mỗi bài); checkpoint 8 câu.
- Slug tháng có tiền tố `month-` (`month-may`, `month-march`…) để `may`, `march` còn trống cho động từ; số thứ tự là `ordinal-first`, `ordinal-second`, `ordinal-third` (`second` còn là "giây"). Số thứ tự khác chỉ nằm trong `ordinal-numbers`.
- `in`, `on` (LEXICAL) mang nghĩa nơi chốn (unit 05); nghĩa thời gian nằm trong GRAMMAR `prepositions-of-time`.
- Đếm được/không đếm được vẫn chỉ nằm trong EXPLAIN của `a1-03-l1-food`; unit 04 không dạy How much/How many theo số lượng để khỏi lẫn với How much (giá).
