# Content coverage

Theo dõi nội dung Wordsly Path đã soạn. Cập nhật khi thêm hoặc sửa unit. Khung lộ trình và phương pháp: `../../../docs/wordsly-path/DESIGN.md` §4.

Trạng thái: `draft` đã soạn, qua validator · `reviewed` đã có người đọc lại · `published` đã có trong một release trên môi trường thật.

## Tổng quan

| Stage | Unit dự kiến | Đã soạn | Bài | Item | LEXICAL | PHRASE | PATTERN | GRAMMAR |
|---|---|---|---|---|---|---|---|---|
| Pre-A1 | 6 | 6 | 18 | 128 | 86 | 28 | 10 | 4 |
| A1 | 10 | 10 | 31 | 260 | 166 | 49 | 33 | 12 |
| A2 | 12 | 12 | 36 | 301 | 155 | 70 | 49 | 27 |
| B1 | 12 | 12 | 36 | 287 | 122 | 68 | 65 | 32 |
| B2 | 12 | 12 | 36 | 288 | 112 | 77 | 66 | 33 |
| C1 | 12 | 12 | 36 | 288 | 70 | 112 | 73 | 33 |

## Placement (`placement.json`)

Một bài xếp lớp cho cả lộ trình, 2 câu mỗi unit, theo thứ tự lộ trình. Thêm câu cho unit mới khi soạn stage mới.

| Stage | Unit có câu | Câu |
|---|---|---|
| Pre-A1 | 6/6 | 12 |
| A1 | 10/10 | 20 |
| A2 | 12/12 | 24 |
| B1 | 12/12 | 24 |
| B2 | 12/12 | 24 |
| C1 | 12/12 | 24 |

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
| 7 | `a1-07-right-now` | hiện tại tiếp diễn, phân biệt với hiện tại đơn, gọi điện thoại | 3 | 25 (12/7/4/2) | 2 | draft |
| 8 | `a1-08-weather-and-clothes` | thời tiết, quần áo, I'm wearing, vị trí tính từ, too | 3 | 28 (24/1/2/1) | 2 | draft |
| 9 | `a1-09-directions` | địa điểm, Is there … near here?, chỉ đường, câu mệnh lệnh, đi bằng gì | 3 | 26 (15/7/3/1) | 2 | draft |
| 10 | `a1-10-say-it-another-way` | chiến lược: tả khi quên từ, câu đệm, tự sửa, hỏi lại | 3 | 21 (7/9/5/0) | 2 | draft |

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
| `im-doing-right-now` | I'm {doing} right now. | 07 |
| `are-you-doing` | Are you {doing} now? | 07 |
| `hello-this-is` | Hello, this is {name}. | 07 |
| `can-i-speak-to` | Can I speak to {name}, please? | 07 |
| `im-wearing` | I'm wearing {clothes}. | 08 |
| `its-too` | It's too {adjective}. | 08 |
| `is-there-a-near-here` | Is there {place} near here? | 09 |
| `wheres-the` | Excuse me, where's the {place}? | 09 |
| `how-do-i-get-to` | How do I get to {place}? | 09 |
| `its-a-kind-of` | It's a kind of {category}. | 10 |
| `its-a-thing-you-use-to` | It's a thing you use to {verb}. | 10 |
| `its-a-place-where` | It's a place where you {activity}. | 10 |
| `its-a-person-who` | It's a person who {does}. | 10 |
| `do-you-mean` | Do you mean {thing}? | 10 |

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
| `present-continuous` | am/is/are + -ing, phủ định, câu hỏi, chính tả -ing | 07 |
| `simple-vs-continuous` | thói quen (hiện tại đơn) và đang xảy ra (tiếp diễn); What do you do? / What are you doing? | 07 |
| `adjectives` | tính từ trước danh từ hoặc sau be, không thêm -s; very và too | 08 |
| `imperatives` | động từ nguyên mẫu đầu câu, Don't, please | 09 |

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
- "I cooking", "I'm cook", tiếp diễn cho thói quen, nhầm What do you do? với What are you doing?, "I am Minh" khi gọi điện, "call to me" (unit 07).
- "Today hot", "My pants is", "news shoes", dùng too để khen (unit 08).
- "You go straight", "turn to left", "in the left", "by foot", "near to" (unit 09).
- Im lặng khi quên từ; "My mean is…"; "a person who work" (unit 10).

### Ghi chú A1

- Unit 06 có 4 bài (7 thứ, 12 tháng và số thứ tự không vừa 3 bài với 6–10 item mới mỗi bài); checkpoint 8 câu.
- Unit 10 không có GRAMMAR (giống `pre-a1-06-help`): chiến lược giao tiếp dạy bằng PHRASE và PATTERN. Các mẫu `its-a-place-where`, `its-a-person-who` dạy mệnh đề quan hệ như cụm cố định; ngữ pháp who/which/where để A2.
- Slug tháng có tiền tố `month-` (`month-may`, `month-march`…) để `may`, `march` còn trống cho động từ; số thứ tự là `ordinal-first`, `ordinal-second`, `ordinal-third` (`second` còn là "giây"). Số thứ tự khác chỉ nằm trong `ordinal-numbers`.
- `in`, `on` (LEXICAL) mang nghĩa nơi chốn (unit 05); nghĩa thời gian nằm trong GRAMMAR `prepositions-of-time`.
- Đếm được/không đếm được vẫn chỉ nằm trong EXPLAIN của `a1-03-l1-food`; unit 04 không dạy How much/How many theo số lượng để khỏi lẫn với How much (giá).

## A2: Elementary

Mốc của stage: "Tôi kể được cuối tuần vừa rồi" (unit 02). Khung 12 unit (chốt ở P4-4a, P4-4b/c soạn theo):

| # | Unit | Can-do (tóm tắt) | Bài | Item (L/Ph/Pa/G) | Dialogue | Trạng thái |
|---|---|---|---|---|---|---|
| 1 | `a2-01-where-were-you` | was/were, hôm qua ở đâu, It was great/boring…, sinh ở đâu năm nào, đọc năm | 3 | 26 (15/5/4/2) | 2 | draft |
| 2 | `a2-02-last-weekend` | quá khứ đơn -ed (3 cách đọc), bất quy tắc hay gặp, did/didn't, kể cuối tuần | 3 | 24 (12/6/3/3) | 2 | draft |
| 3 | `a2-03-my-story` | mốc trong đời + năm, kể theo trình tự (first, then…), used to, When I was… | 3 | 25 (15/5/3/2) | 2 | draft |
| 4 | `a2-04-plans` | be going to, mời / nhận lời / từ chối, How about…?, want/hope/would like to | 3 | 25 (12/7/4/2) | 2 | draft |
| 5 | `a2-05-travel` | by + phương tiện, How long does it take?, sân bay, giờ tàu xe (hiện tại đơn), khách sạn, Could you…? | 3 | 26 (15/4/5/2) | 2 | draft |
| 6 | `a2-06-health` | bộ phận cơ thể, My … hurts, have a + bệnh, hỏi thăm người ốm, đi khám, should / shouldn't | 3 | 27 (15/7/3/2) | 2 | draft |
| 7 | `a2-07-work` | work at/in/for/as, sếp và đồng nghiệp, have to / don't have to, can / can't (khả năng), phỏng vấn | 3 | 27 (14/5/5/3) | 2 | draft |
| 8 | `a2-08-comparing` | so sánh hơn (-er / more, better, worse), so sánh nhất (the -est / the most), as … as, the same as, different from, prefer | 3 | 24 (13/3/5/3) | 2 | draft |
| 9 | `a2-09-experiences` | hiện tại hoàn thành cho trải nghiệm (ever, never, been to), V3, chuyển sang quá khứ đơn khi kể chi tiết, How many times, first time, already / yet | 3 | 24 (11/6/4/3) | 2 | draft |
| 10 | `a2-10-how-much-how-many` | đếm được / không đếm được, some / any, How much / How many, a lot of, a few / a little, đơn vị (a bottle of), đi chợ, công thức nấu ăn | 3 | 25 (15/3/4/3) | 2 | draft |
| 11 | `a2-11-people` | ngoại hình (be / have, tóc), tính cách, What does … look like? / What's … like?, get along with, who / which / where | 3 | 25 (15/4/4/2) | 2 | draft |
| 12 | `a2-12-keep-it-going` | chiến lược: phản hồi (Really?, That sounds…, Me too / neither), câu hỏi mở, đổi chủ đề (By the way, Speaking of), kết thúc lịch sự; can-do tổng kết A2 | 3 | 23 (3/15/5/0) | 2 | draft |

### Mẫu câu (PATTERN)

| Item | Template | Unit |
|---|---|---|
| `i-was-at` | I was at {place} {when}. | 01 |
| `where-were-you` | Where were you {when}? | 01 |
| `how-was` | How was {thing}? | 01 |
| `i-was-born-in` | I was born in {placeOrYear}. | 01 |
| `what-did-you-do` | What did you do {when}? | 02 |
| `i-did-last-weekend` | I {did} last weekend. | 02 |
| `did-you` | Did you {do}? | 02 |
| `i-did-in-year` | I {did} in {year}. | 03 |
| `i-used-to` | I used to {do}. | 03 |
| `when-i-was` | When I was {age}, I {did}. | 03 |
| `im-going-to` | I'm going to {do} {when}. | 04 |
| `would-you-like-to` | Would you like to {do}? | 04 |
| `how-about` | How about {suggestion}? | 04 |
| `i-want-to` | I want to {do} someday. | 04 |
| `how-long-does-it-take` | How long does it take to get to {place}? | 05 |
| `it-takes` | It takes {time} by {transport}. | 05 |
| `what-time-does-leave` | What time does the {transport} leave? | 05 |
| `id-like-a-room-for` | I'd like a {kind} room for {nights}. | 05 |
| `could-you` | Could you {do}, please? | 05 |
| `my-hurts` | My {bodyPart} hurts. | 06 |
| `i-have-a` | I have a {symptom}. | 06 |
| `you-should` | You should {do}. | 06 |
| `i-work-at` | I work at {place}. | 07 |
| `i-have-to` | I have to {do} {when}. | 07 |
| `do-you-have-to` | Do you have to {do}? | 07 |
| `i-can` | I can {do}. | 07 |
| `can-you` | Can you {do}? | 07 |
| `is-er-than` | {thing} is {comparative} than {other}. | 08 |
| `its-the-est` | It's the {superlative} {thing} in {place}. | 08 |
| `whats-the-best` | What's the best {thing} in {place}? | 08 |
| `not-as-as` | {thing} isn't as {adjective} as {other}. | 08 |
| `which-is-better` | Which is better, {first} or {second}? | 08 |
| `have-you-ever` | Have you ever {experience}? | 09 |
| `ive-never` | I've never {experience}. | 09 |
| `when-did-you` | When did you {do}? | 09 |
| `how-many-times` | How many times have you {experience}? | 09 |
| `is-there-any` | Is there any {food} in the fridge? | 10 |
| `how-many-do-we-need` | How many {things} do we need? | 10 |
| `how-much-do-we-need` | How much {thing} do we need? | 10 |
| `add-some` | Add {amount} {food}. | 10 |
| `what-does-look-like` | What does {person} look like? | 11 |
| `has-hair` | {person} has {hair} hair. | 11 |
| `whats-like` | What's {person} like? | 11 |
| `the-person-who` | {person} is the {noun} who {does}. | 11 |
| `that-sounds` | That sounds {adjective}. | 12 |
| `what-kind-of` | What kind of {thing} do you like? | 12 |
| `do-you-often` | Do you often {do}? | 12 |
| `what-do-you-think-of` | What do you think of {thing}? | 12 |
| `speaking-of` | Speaking of {topic}, {question} | 12 |

### Ngữ pháp (GRAMMAR)

| Item | Điểm ngữ pháp | Unit |
|---|---|---|
| `was-were` | quá khứ của be: was/were, wasn't/weren't, Were you…? | 01 |
| `saying-years` | đọc năm (nineteen ninety-eight, two thousand five, twenty nineteen), in + năm | 01 |
| `past-simple-regular` | quá khứ đơn -ed, chính tả, ba cách đọc /t/ /d/ /ɪd/ | 02 |
| `past-simple-irregular` | went, had, saw, ate, bought, met, did | 02 |
| `past-simple-did` | didn't + nguyên mẫu, Did…?, trả lời ngắn | 02 |
| `sequencing` | first, then, after that, suddenly, finally; before/after | 03 |
| `used-to` | used to + nguyên mẫu, didn't use to, Did you use to…? | 03 |
| `be-going-to` | am/is/are going to + nguyên mẫu: kế hoạch | 04 |
| `verb-to-infinitive` | want / hope / plan / would like + to + nguyên mẫu | 04 |
| `by-transport` | by + phương tiện (không a/the), take the bus / a taxi, on foot | 05 |
| `could-requests` | Could you…? (nhờ), Could I…? (xin phép), trả lời Sure / Of course | 05 |
| `have-for-illness` | have a + bệnh, have a …ache, bộ phận + hurts | 06 |
| `should-shouldnt` | should / shouldn't + nguyên mẫu, Should I…?, What should I do? | 06 |
| `work-prepositions` | work at (nơi) / in (thành phố, ngành) / for (công ty) / as (nghề) | 07 |
| `have-to` | have to / has to, don't have to (không cần, khác cấm), Do you have to…?, had to | 07 |
| `can-ability` | can / can't chỉ khả năng, trả lời ngắn, cách đọc /kən/ và /kænt/ | 07 |
| `comparatives` | -er / more … than, chính tả, better / worse | 08 |
| `superlatives` | the -est / the most, the best / the worst, in + nơi chốn | 08 |
| `as-as` | as … as, not as … as, the same as, different from, much / a lot + so sánh hơn | 08 |
| `present-perfect-experience` | have / has + V3 cho trải nghiệm, ever / never, Yes, I have, been to và gone to | 09 |
| `past-participles` | V3 có quy tắc và bất quy tắc hay gặp (been, seen, eaten, done, taken) | 09 |
| `perfect-vs-past` | mở đầu bằng hiện tại hoàn thành, kể chi tiết bằng quá khứ đơn; có mốc thời gian thì luôn quá khứ đơn | 09 |
| `countable-uncountable` | đếm được / không đếm được, động từ chia theo, đơn vị (a bottle of) | 10 |
| `some-any` | some (khẳng định, mời), any (phủ định, câu hỏi) | 10 |
| `how-much-how-many` | How much / How many, much / many / a lot of, a few / a little, too much / too many, How much (giá) và (lượng) | 10 |
| `describing-people` | be + tính từ, have + tóc / mắt, thứ tự tính từ tả tóc, look like / be like / like | 11 |
| `relative-clauses` | who / which / where (that thân mật), không lặp đại từ | 11 |

### Lỗi thường gặp của người Việt (A2)

- Giữ hiện tại khi kể quá khứ ("Yesterday I am at home"), "They was", "Yesterday I tired", "I was boring" thay cho bored, fun và funny, "in last week", "ago two days", "I born in…", đọc năm như số đếm (unit 01).
- Nuốt đuôi -ed, đọc thừa /ɪd/ ("watch-ed"), "I was clean the house", "goed/buyed/eated", "went to home", "I didn't went", "Did you saw", "I didn't tired" (unit 02).
- "I was graduated", "married with", đổi thì giữa câu chuyện, remember và miss (hai nghĩa của "nhớ"), "I use to" cho hiện tại, "used to playing", "drive a bike" (unit 03).
- "I going to", "going to studying", "Would you like go", "Yes, I would like", từ chối cộc "No.", "How about go", "I want travel", "She want to goes", "go to abroad", "get up soon" (unit 04).
- "by the bus", "by foot", "How long do you take?", "an hour" bị đọc thành "a hour", "What time does the bus leaves?", "arrive to", "Give me the key" (cộc) thay vì Could I have…?, "Could you helping", "I'm going on a travel" (unit 05).
- "I'm fever", "I have headache", "I hurt head" khi ý là đang đau đầu, "I have a cold" và "I'm cold", "drink medicine", "You should to rest", "Do I should…?", "check a doctor", arm/hand và leg/foot (tiếng Việt đều là "tay", "chân") (unit 06).
- "a work", "I work as engineer", "She have to", "I have work late", don't have to hiểu thành "không được", "Yes, I have." khi trả lời Do you have to…?, "I know swim", "I can to swim", "talk English", "speak very well English", nuốt /t/ của can't, "an uniform", "get up soon" (unit 07).
- "more cheaper", "expensiver", "cheaper that", "gooder", quên the ở so sánh nhất, "the tallest of Vietnam", "high" cho người, "as bigger as", "the same like", "different with", "very better", "prefer A than B", quiet và quite (unit 08).
- "I ever been…", "Have you ever went / ate…?", "I haven't never", "Yes, I did." cho Have you ever…?, hiện tại hoàn thành với mốc thời gian ("I've been there last year"), "When have you been…?", "How many time", "I already have eaten", "I didn't try yet", "I was scary", "very amazing" (unit 09).
- "a rice", "three tomato", "The rice are", "There isn't some milk", "Is there any eggs?", "How many water", "How much eggs", "I have much money", "a few salt", "too much people", "It's taste good", "fry rice", "pig meat" (unit 10).
- "She is long hair", "black long hair", "hairs", nhầm What's she like? / What does she like? / What does she look like?, "How does she look like?", "He is fun" (ý hài hước), "work hardly", "low" cho người thấp, "the man which", "the woman who she lives", "the restaurant where we ate there", "You look like tired" (unit 11).
- Im lặng khi nghe (không phản hồi), "Me too" sau câu phủ định, "That's sound good", "Say me more", "What did happen next?", "How do you think about…?", actually hiểu là "hiện nay", "I go now", "keep contact", "Nice to meet you" khi chia tay (unit 12).

### Ghi chú A2

- Động từ bất quy tắc là item LEXICAL riêng theo dạng quá khứ (`went`, `had`, `saw`, `ate`, `bought`, `met`, `took`), nghĩa ghi rõ "quá khứ của …"; dạng nguyên mẫu go, have, see… chưa có item riêng. grew, got, rode chỉ nằm trong item cụm (`grow-up`, `get-a-job`, `ride-a-bike`).
- `first` (LEXICAL, "đầu tiên" khi kể chuyện) khác `ordinal-first` (số thứ tự, A1).
- `friend`, `school`, `happy` chưa có ở Pre-A1 và A1 nên được giới thiệu ở `a2-01`.
- `a2-05` dạy giờ tàu xe bằng hiện tại đơn trong EXPLAIN của bài 2 (tái dùng `present-simple-s`), không có GRAMMAR riêng. `travel` (a2-04) chỉ RECYCLE ở unit 05; `trip` là danh từ, `travel` là động từ.
- `back` (LEXICAL) là "lưng"; nghĩa "trở lại" chỉ nhắc trong `noteVi`. `tooth` dạy số nhiều bất quy tắc teeth; foot/feet và hand chỉ nằm trong `noteVi` và EXPLAIN.
- `a2-06` chưa dạy riêng catch a cold, the flu, a pill (chỉ trong `noteVi` và hội thoại). Hội thoại đi khám có "How long have you had it?" (hiện tại hoàn thành, unit 09) ở lượt bác sĩ.
- `can-you` (a2-07) là hỏi khả năng; nhờ lịch sự đã có ở `could-you` (a2-05). `well` (A1) là từ đệm "à thì", còn trạng từ "giỏi" nằm ở PHRASE `very-well`.
- `a2-08`: so sánh hơn và nhất là GRAMMAR, không có item riêng cho từng dạng (-er, -est) trừ bất quy tắc `better`, `worse`; `best` chỉ nằm trong `superlatives` và `whats-the-best`.
- `a2-09`: dạng V3 nằm trong GRAMMAR `past-participles`, chỉ `been` là item LEXICAL. Hiện tại hoàn thành chỉ dạy nghĩa trải nghiệm (và already / yet); nghĩa kéo dài tới hiện tại với for / since (How long have you…?) để B1. `never` (A1) chỉ RECYCLE.
- `a2-10`: `how-much-is` (giá, A1) RECYCLE ở bài 2 để phân biệt với How much (lượng). a few / a little, too much / too many nằm trong `how-much-how-many` và `too-much-too-many`; pork, beef, garlic, oil, pepper chỉ nằm trong ví dụ và hội thoại.
- `a2-11`: `short` gồm cả nghĩa "thấp" (người). straight, wavy, roommate chỉ nằm trong `noteVi` và ví dụ. `look-like` (giống ai) khác `what-does-look-like` (hỏi ngoại hình).
- `a2-12` không có GRAMMAR (như `pre-a1-06`, `a1-10`). canDo thứ tư là câu tổng kết stage; checkpoint 8 câu, 2 câu cuối ôn A2 (`perfect-vs-past`, `be-going-to`).
- Hiện tại tiếp diễn cho lịch hẹn tương lai (I'm meeting Anna tomorrow) chưa dạy riêng; chỉ xuất hiện trong hội thoại.

## B1: Intermediate

Mốc của stage: "Tôi bày tỏ và bảo vệ được ý kiến đơn giản" (unit 04). Khung 12 unit (chốt ở P4-5a, P4-5b/c soạn theo):

| # | Unit | Can-do (tóm tắt) | Bài | Item (L/Ph/Pa/G) | Dialogue | Trạng thái |
|---|---|---|---|---|---|---|
| 1 | `b1-01-how-long` | hiện tại hoàn thành với for / since, How long have you…?, hiện tại hoàn thành tiếp diễn (dạo này), be used to / get used to, ổn định ở nơi mới | 3 | 24 (9/5/6/4) | 2 | draft |
| 2 | `b1-02-what-happened` | quá khứ tiếp diễn, was doing when… / while, kể chuyện có đầu có đuôi, phản ứng khi nghe (How awful!, What a relief!) | 3 | 23 (10/7/4/2) | 2 | draft |
| 3 | `b1-03-future` | will dự đoán (probably, definitely), I'll / Shall I…? (đề nghị, hứa, quyết định ngay), lịch hẹn bằng hiện tại tiếp diễn, chọn will / going to | 3 | 24 (8/8/5/3) | 2 | draft |
| 4 | `b1-04-in-my-opinion` | nêu và hỏi ý kiến, đồng ý / phản đối lịch sự, because / so / although / on the other hand; mốc của stage | 3 | 24 (9/8/4/3) | 2 | draft |
| 5 | `b1-05-if-and-when` | câu điều kiện loại 1, What will you do if…?, when / as soon as / until / unless + hiện tại đơn, môi trường và hậu quả | 3 | 24 (8/10/4/2) | 2 | draft |
| 6 | `b1-06-if-i-were-you` | câu điều kiện loại 2, What would you do if…?, lời khuyên (Why don't you…?, If I were you, You'd better), I wish / hope | 3 | 24 (9/6/6/3) | 2 | draft |
| 7 | `b1-07-problems` | báo đồ hỏng (isn't working, keeps + V-ing, chủ nhà), đổi / trả hàng (Would you mind + V-ing?), xin lỗi, I'm afraid…, đưa giải pháp (vai lễ tân) | 3 | 24 (13/2/6/3) | 2 | draft |
| 8 | `b1-08-made-in` | bị động hiện tại (made in / of, grown, exported) và quá khứ (was built, designed by), địa danh Hà Nội, kể tin ngắn (was stolen, was canceled) | 3 | 24 (14/1/6/3) | 2 | draft |
| 9 | `b1-09-she-said` | câu tường thuật (said, told, lùi thì), asked if / wh-, asked / told + người + to V, nhận và chuyển lời nhắn qua điện thoại, kể lại tin (I heard that…, promised to, warned, apparently) | 3 | 24 (12/3/6/3) | 2 | draft |
| 10 | `b1-10-work-and-study` | V-ing và to V sau động từ (enjoy, don't mind, decide to), chuyên ngành, bằng cấp, tính từ -ed / -ing (I find it…, The best part is…), giới từ + V-ing, phỏng vấn xin việc (điểm mạnh, điểm yếu, look forward to) | 3 | 24 (12/2/7/3) | 2 | draft |
| 11 | `b1-11-must-be` | đoán hiện tại (must / might / can't be, whose), đoán quá khứ khi tìm đồ mất (must have / might have + V3, look for), look / seem / sound, It looks like…, I bet, No wonder | 3 | 24 (11/4/6/3) | 2 | draft |
| 12 | `b1-12-strategy` | chiến lược: làm rõ (What do you mean by…?, I didn't catch that), kiểm tra hiểu (So you're saying…?), câu giờ và nói mềm (kind of, I might be wrong, but…), ngắt lời lịch sự, quay lại ý, tóm lại; can-do tổng kết B1 | 3 | 24 (7/12/5/0) | 2 | draft |

### Mẫu câu (PATTERN)

| Item | Template | Unit |
|---|---|---|
| `how-long-have-you` | How long have you {done}? | 01 |
| `ive-for` | I've {done} for {time}. | 01 |
| `ive-since` | I've {done} since {when}. | 01 |
| `ive-been-doing` | I've been {doing} {howLong}. | 01 |
| `im-used-to` | I'm used to {thing}. | 01 |
| `im-getting-used-to` | I'm getting used to {thing}. | 01 |
| `what-were-you-doing` | What were you doing {when}? | 02 |
| `i-was-doing` | I was {doing} {when}. | 02 |
| `i-was-when` | I was {doing} when {event}. | 02 |
| `how-adjective` | How {adjective}! | 02 |
| `i-think-will` | I think {subject} will {verb}. | 03 |
| `ill-do` | I'll {do}. | 03 |
| `shall-i` | Shall I {do}? | 03 |
| `what-are-you-doing-on` | What are you doing on {day}? | 03 |
| `are-you-doing-anything` | Are you doing anything {when}? | 03 |
| `in-my-opinion` | In my opinion, {opinion}. | 04 |
| `i-dont-think` | I don't think {opinion}. | 04 |
| `how-do-you-feel-about` | How do you feel about {topic}? | 04 |
| `the-main-reason` | The main reason is that {reason}. | 04 |
| `if-ill` | If {condition}, I'll {do}. | 05 |
| `what-will-you-do-if` | What will you do if {condition}? | 05 |
| `ill-call-you-when` | I'll call you when {event}. | 05 |
| `if-we-dont` | If we don't {action}, {result}. | 05 |
| `if-i-had-id` | If I had {thing}, I'd {do}. | 06 |
| `what-would-you-do-if` | What would you do if {situation}? | 06 |
| `if-i-were-you` | If I were you, I'd {do}. | 06 |
| `why-dont-you` | Why don't you {do}? | 06 |
| `youd-better` | You'd better {do}. | 06 |
| `i-wish-i` | I wish I {wish}. | 06 |
| `isnt-working` | The {thing} isn't working. | 07 |
| `theres-something-wrong-with` | There's something wrong with {thing}. | 07 |
| `id-like-to-return` | I'd like to return {thing}. | 07 |
| `would-you-mind` | Would you mind {doing}? | 07 |
| `im-afraid` | I'm afraid {problem}. | 07 |
| `im-sorry-for` | I'm sorry for {what}. | 07 |
| `is-made-in` | {thing} is made in {place}. | 08 |
| `its-made-of` | It's made of {material}. | 08 |
| `it-was-built-in` | It was built in {when}. | 08 |
| `was-done-by` | It was {done} by {someone}. | 08 |
| `my-was-stolen` | My {thing} was stolen. | 08 |
| `did-you-hear-about` | Did you hear about {news}? | 08 |
| `she-said` | She said {clause}. | 09 |
| `he-told-me` | He told me {clause}. | 09 |
| `she-asked-if` | She asked if {clause}. | 09 |
| `he-asked-me-to` | He asked me to {do}. | 09 |
| `i-heard-that` | I heard that {news}. | 09 |
| `she-promised-to` | She promised to {do}. | 09 |
| `i-enjoy` | I enjoy {doing}. | 10 |
| `ive-decided-to` | I've decided to {do}. | 10 |
| `i-dont-mind` | I don't mind {doing}. | 10 |
| `i-find-it` | I find it {adjective}. | 10 |
| `the-best-part-is` | The best part is {thing}. | 10 |
| `im-good-at` | I'm good at {doing}. | 10 |
| `im-interested-in` | I'm interested in {thing}. | 10 |
| `it-must-be` | It must be {guess}. | 11 |
| `she-might-be` | She might be {guess}. | 11 |
| `it-cant-be` | It can't be {guess}. | 11 |
| `i-must-have` | I must have {done}. | 11 |
| `you-might-have` | You might have {done}. | 11 |
| `it-looks-like` | It looks like {clause}. | 11 |
| `what-do-you-mean-by` | What do you mean by {word}? | 12 |
| `so-youre-saying` | So you're saying {clause}? | 12 |
| `i-might-be-wrong-but` | I might be wrong, but {opinion}. | 12 |
| `it-seems-to-me` | It seems to me that {opinion}. | 12 |
| `the-point-is` | The point is {clause}. | 12 |

### Ngữ pháp (GRAMMAR)

| Item | Điểm ngữ pháp | Unit |
|---|---|---|
| `present-perfect-duration` | have / has + V3 cho việc kéo dài tới giờ; so với hiện tại đơn và quá khứ đơn | 01 |
| `for-since` | for + khoảng thời gian, since + mốc; ago nói cùng ý | 01 |
| `present-perfect-continuous` | have / has been + V-ing, How long have you been…?, lately; động từ trạng thái không -ing | 01 |
| `be-used-to` | be used to / get used to + danh từ / V-ing, so với used to + nguyên mẫu | 01 |
| `past-continuous` | was / were + V-ing, bối cảnh câu chuyện | 02 |
| `past-simple-vs-continuous` | việc dài (tiếp diễn) và việc ngắn xen vào (quá khứ đơn), when / while | 02 |
| `will-future` | will / won't dự đoán, probably / definitely, I don't think … will | 03 |
| `will-offers-promises` | I'll quyết định ngay, đề nghị, hứa; Shall I…? | 03 |
| `future-forms` | hiện tại tiếp diễn (lịch hẹn), going to (kế hoạch), will, hiện tại đơn (lịch cố định) | 03 |
| `giving-opinions` | I think / I believe / In my opinion, I don't think…, hỏi ý kiến | 04 |
| `agree-disagree` | I agree (không có am), đồng ý một phần, phản đối mềm | 04 |
| `linking-reasons` | because / because of, so, but, although; không ghép Vì… nên…, Mặc dù… nhưng… | 04 |
| `first-conditional` | If + hiện tại đơn, will + V; không will trong vế if | 05 |
| `time-clauses` | when / as soon as / until / before / after / unless + hiện tại đơn khi nói tương lai; if và when | 05 |
| `second-conditional` | If + quá khứ đơn, would + V; If I were; loại 1 và loại 2 | 06 |
| `giving-advice` | Why don't you…?, should, If I were you, I'd…, You'd better (not) + V | 06 |
| `i-wish` | I wish + quá khứ đơn / could / were; wish và hope | 06 |
| `describing-problems` | isn't working / doesn't work, is broken, keep + V-ing, There's something wrong with…, hasn't worked since | 07 |
| `polite-requests` | Could you…?, Is it possible to…?, Would you mind + V-ing? (đáp No, not at all) | 07 |
| `apologizing` | I'm sorry for + danh từ / V-ing, I'm afraid…, Let me…, It won't happen again | 07 |
| `passive-present` | am / is / are + V3; made in / of / by | 08 |
| `passive-past` | was / were + V3, When was it built?, by | 08 |
| `passive-or-active` | bị động khi không biết / không cần người làm; happen không có bị động | 08 |
| `reported-speech` | said (that) / told + người + mệnh đề, lùi thì (am → was, will → would, can → could), đổi đại từ; điều còn đúng giữ hiện tại | 09 |
| `reported-questions` | asked if / whether + S + V, asked + wh- + S + V (không đảo), asked / told + người + (not) to V | 09 |
| `reporting-verbs` | promise / agree to V, warn + người + (not) to V, admit, explain, complain about; I heard that…, Apparently… | 09 |
| `gerund-infinitive` | enjoy / finish / mind / avoid / keep + V-ing, want / decide / plan / hope / agree / need + to V, like / love / start cả hai; V-ing làm chủ ngữ | 10 |
| `ed-ing-adjectives` | -ed cảm giác của người, -ing thứ gây ra cảm giác (bored / boring, excited, confused, tired, embarrassed, stressed / stressful) | 10 |
| `preposition-ing` | giới từ + V-ing: good at, interested in, look forward to, before / after, thank you for | 10 |
| `deduction-present` | must / might / may / could / can't + V khi đoán; phủ định là can't, không phải mustn't | 11 |
| `must-have-done` | must / might / could / can't have + V3; đọc must've, might've | 11 |
| `looks-seems` | look / sound / seem + tính từ, + like + danh từ / mệnh đề, seem to V | 11 |

### Lỗi thường gặp của người Việt (B1)

- "I live here for five years", "How long do you live here?", "since three years (ago)", "from 2019" với hiện tại hoàn thành, "I've been knowing", "I'm learning English for three years", "How are you been?", "I'm used to get up", "I used to the weather", "a traffic", "a strange" (người lạ) (unit 01).
- "I watching TV at 8", "I was watch", "They was", "What did you doing?", "What was happened?", "I cooked when the phone rang" (ý là đang nấu), while với việc ngắn, "falled", "at the end" thay cho in the end, "How is awful!", "How relief!", "I was embarrassing" (unit 02).
- "It will rains", "I think it won't rain", "It will rain probably", won't và want, "after ten years" (ý là mười năm nữa), "I don't hope so", "I carry it for you" (đề nghị), "I will to call", "Don't worry for me", "That's kind for you", "I will meet Lan tonight" (đã hẹn), "What will you do this weekend?", "I don't sure", "I'll let you to know" (unit 03).
- "In my opinion, I think", "According to me", "I think it's not a good idea", "How do you think about…?", "I'm agree", "I'm not agree", "I understand what do you mean", "Good idea" khi người kia chỉ nêu ý kiến, "Because…, so…", "Although…, but…", "because the traffic", "In the other hand", convenient và comfortable (unit 04).
- "If it will rain", "If it rain", "when I will get home", "unless it doesn't rain", "until I don't come back", "lose the bus", "get to home", "remind me call", "close the light", "open the TV", "a pollution", "the climate change" (unit 05).
- "If I have more money, I'd…", "If I would have", "If I am you", "You'd better to go", "an advice", "advices", "I'm stress", "I wish I have", "I wish I can", "I wish you pass the exam" (ý là hope), "I'm possible to come" (unit 06).
- "It's not work", "It is broken since Monday", "It keeps to turn off", "Would you mind to check", đáp Yes cho Would you mind…?, "It's not fit", nhầm receipt và recipe, "Sorry for late", "Sorry for make a mistake", "Let me to check", I'm afraid hiểu là sợ, "do a mistake" (unit 07).
- "It made in Vietnam", "Coffee is grew", "made from Japan", "made in wood", "It built in 1902", "When did it build?", "builded", "It was designed from…", "What was happened?", "My bike stole", "a news", "the news are", "cancelled" / "canceled" (Anh / Mỹ) (unit 08).
- "She said me…", "He told that…", "explain me", "mention about", "He asked where did I live", "She asked me are you free", "asked me call", "He told me don't be late", "promised that she will", "warned me don't", "complain with", "between you and I" (unit 09).
- "I enjoy to work", "I decided studying", "Learn English is hard", "avoid to eat", "a degree of IT", "I'm boring" (ý là chán), "I'm exciting about…", "My job is stressed", "I'm interesting in…", "good in", "look forward to hear", "After graduate, I…" (unit 10).
- "She must busy", "It mustn't be true" (ý là chắc chắn không), "She maybe sick", "Who's phone", "I must left it", "I must have leave it", viết "must of", "I'm finding my key" (ý là đang tìm), "You look like tired", "It sounds a good idea", "He seems know", "What do you think did happen?" (unit 11).
- "I don't understand" khi chỉ là nghe không kịp, "What do you mean about…?", gật đầu khi chưa hiểu, "It seems to me that I think…", "Sorry for interrupt", "Wait, wait!" để ngắt lời, "Conclusion, …", đọc h trong honestly (unit 12).

### Ghi chú B1

- `b1-01`: `lately` và `recently` đều là item; `known` là item LEXICAL (V3 của know, như `been` ở A2) vì hay dùng với for / since. `used-to` (A2) RECYCLE ở bài 3 để so với be used to.
- `b1-02`: `fell`, `lost` là item theo dạng quá khứ như động từ bất quy tắc A2; rang chỉ nằm trong item `ring`. `embarrassed` dạy ở đây; cặp -ed / -ing đầy đủ để unit 10. "You won't believe…" là cụm cố định, will dạy ở unit 03.
- `b1-03`: hiện tại tiếp diễn cho lịch hẹn (chưa dạy ở A2) nằm trong `future-forms`; lịch tàu xe hiện tại đơn chỉ nhắc lại (đã có ở `a2-05`).
- `b1-04`: `what-do-you-think-of` (A2) RECYCLE, không làm item "What do you think about…?" riêng. because, although là item LEXICAL; so, but chỉ nằm trong `linking-reasons`. Checkpoint 6 câu như các unit thường; câu hỏi ôn cả stage để `b1-12`.
- `b1-05`: hiện tại đơn sau when / as soon as / until / unless nằm chung GRAMMAR `time-clauses`; `as-soon-as` là PHRASE, `until`, `unless` là LEXICAL. `miss-the-bus` là PHRASE vì `miss` (nhớ) đã là item A2. Chủ đề môi trường ở bài 3 dùng lại `in-my-opinion`, `linking-reasons`.
- `b1-06`: loại 1 và loại 2 so sánh trong EXPLAIN bài 1. `should-shouldnt`, `you-should` (A2) RECYCLE, lời khuyên mới gom trong `giving-advice`. hope (A2) chỉ nhắc trong EXPLAIN để phân biệt với wish.
- `b1-07`: bài 3 cho người học đóng vai lễ tân (người xử lý phàn nàn) để luyện phía xin lỗi và đưa giải pháp. `air-conditioner` là LEXICAL hai chữ như `living-room`. Thì hiện tại hoàn thành (hasn't worked since) RECYCLE từ `b1-01`.
- `b1-08`: V3 lấy từ `past-participles` (A2); build, steal có dạng bất quy tắc trong `noteVi`. Hội thoại địa danh dùng Nhà hát Lớn (1911) và cầu Long Biên (1902) ở Hà Nội. Chính tả Mỹ canceled; gap chấp nhận cả cancelled.
- `b1-09`: lùi thì dạy ở mức cơ bản (am / is → was, hiện tại đơn → quá khứ đơn, will → would, can → could); lùi hiện tại hoàn thành / quá khứ đơn → quá khứ hoàn thành chưa dạy (để B2). say / said không là item riêng, nằm trong `reported-speech` và `she-said`; `tell` là LEXICAL. `apparently` giới thiệu ở bài 1, RECYCLE ở bài 3. `guess-what`, `did-you-hear-about`, `you-wont-believe` (B1 02, 08) RECYCLE ở bài 3.
- `b1-10`: `verb-to-infinitive` (A2) RECYCLE ở bài 1; gerund mới gom trong `gerund-infinitive`. `tiring` chỉ nằm trong ví dụ (tired, boring, interesting đã là item A2); cặp -ed / -ing gom trong `ed-ing-adjectives`; `embarrassed`, `stressed` RECYCLE. apply for, responsible for chỉ nằm trong ví dụ / `noteVi`. Hội thoại phỏng vấn có RECYCLE hiện tại hoàn thành (I've worked … for two years).
- `b1-11`: `guess` (động từ) là LEXICAL, khác `guess-what` (B1 02). `it-looks-like` (đoán) khác `look-like` (giống ai, A2). V3 lấy từ `past-participles` (A2), RECYCLE ở bài 2. `what-a-relief` (B1 02) dùng lại trong hội thoại tìm ví.
- `b1-12` không có GRAMMAR (như `pre-a1-06`, `a1-10`, `a2-12`). A1 `a1-10` đã có `i-mean`, `do-you-mean`, `in-other-words`, `let-me-think`, nên ở đây chỉ RECYCLE; `kind-of` (hơi) khác `its-a-kind-of` (một loại, A1). canDo thứ tư là câu tổng kết B1; checkpoint 8 câu, 2 câu cuối ôn B1 (`present-perfect-duration`, `second-conditional`).

## B2: Upper-intermediate

Mốc của stage: "Tôi thảo luận được chủ đề trừu tượng" (unit 03). Khung 12 unit (chốt ở P4-6a, P4-6b/c soạn theo):

| # | Unit | Can-do (tóm tắt) | Bài | Item (L/Ph/Pa/G) | Dialogue | Trạng thái |
|---|---|---|---|---|---|---|
| 1 | `b2-01-had-happened` | quá khứ hoàn thành (when I got there…, by the time, never … before, it turned out), các thì kể chuyện và quá khứ hoàn thành tiếp diễn, tường thuật lùi thì đầy đủ (the day before, the next day, deny / insist / claim / suggest) | 3 | 24 (11/6/4/3) | 2 | draft |
| 2 | `b2-02-if-only` | điều kiện loại 3 (If I'd known…, otherwise, thanks to), should have / shouldn't have / could have, nhận lỗi và an ủi, I wish I'd… / If only…, tiếc nuối (looking back, make the most of) | 3 | 24 (8/7/6/3) | 2 | draft |
| 3 | `b2-03-debate` | nêu và bảo vệ luận điểm (I'm convinced that, There's no doubt that, What's more, evidence), phản bác và nhượng bộ (I see your point, but…, despite, whereas, even so, admittedly), khái quát hóa chủ đề trừu tượng (tend to, on the whole, pros and cons); mốc của stage | 3 | 24 (11/6/4/3) | 2 | draft |
| 4 | `b2-04-the-news` | bị động tường thuật (It's reported that, is expected to, according to), have / get something done (sửa, cắt tóc, rip-off), mô tả số liệu tăng giảm (rise by, increase in, slightly, compared to) | 3 | 24 (13/3/5/3) | 2 | draft |
| 5 | `b2-05-at-work` | công sở trang trọng: email (I'm writing to…, Please find attached, I look forward to…), họp, đề xuất (I'd suggest…, Would it be possible to…?), từ chối khéo | 3 | 24 (11/4/6/3) | 2 | draft |
| 6 | `b2-06-which-means` | mệnh đề quan hệ không xác định (, who / , which), which nối cả câu, whose / where / when, mô tả người, nơi, sản phẩm chi tiết | 3 | 24 (11/3/7/3) | 2 | draft |
| 7 | `b2-07-by-then` | tương lai tiếp diễn (I'll be working), tương lai hoàn thành (I'll have finished by…), kế hoạch dài hạn, dự đoán xu hướng | 3 | 24 (11/5/5/3) | 2 | draft |
| 8 | `b2-08-phrasal-verbs` | cụm động từ thông dụng theo chủ đề (figure out, put off, come up with, run out of, get over), tách / không tách được | 3 | 24 (2/15/4/3) | 2 | draft |
| 9 | `b2-09-supposed-to` | be supposed to (quy định, was supposed to: kế hoạch hỏng, in theory), be allowed to / let / Is it OK if I…?, prohibited, ban, don't need to / didn't need to / needn't have + V3, phàn nàn về thủ tục (What's the point of…?, It doesn't make sense, paperwork) | 3 | 24 (10/4/7/3) | 2 | draft |
| 10 | `b2-10-linking` | từ nối đầu câu (however, therefore, in addition, on top of that, as a result, meanwhile, not only … but also), nguyên nhân – kết quả (because of, due to, has led to, result in, factor), trình bày quy trình (The first step is to…, once, bị động), kể lại một bài báo (The article says…, point out, in a nutshell) | 3 | 24 (9/8/4/3) | 2 | draft |
| 11 | `b2-11-what-if` | giả định: Suppose / What if + quá khứ, in that case, the worst-case scenario, a backup plan; I'd rather + V / + người + quá khứ, I'd rather not, It's time we + quá khứ; câu điều kiện hỗn hợp (If I'd…, I'd … now; If I weren't…, I would have…) | 3 | 24 (8/7/6/3) | 2 | draft |
| 12 | `b2-12-strategy` | chiến lược B2: diễn đạt vòng ý trừu tượng (There's no exact word for it, It has to do with…, It's not exactly…, more like…, It's the feeling you get when…), tự sửa (Let me rephrase that, What I meant was…, or rather, Where was I?), giữ lượt và kéo dài câu trả lời (If I could just finish, Another thing is that…, Take…, for example, Having said that); can-do tổng kết B2 | 3 | 24 (7/9/8/0) | 2 | draft |

### Mẫu câu (PATTERN)

| Item | Template | Unit |
|---|---|---|
| `when-i-got-there` | When I got there, {event}. | 01 |
| `i-had-never-before` | I had never {done} before. | 01 |
| `id-been-waiting` | I'd been {doing} for {time}. | 01 |
| `she-said-shed` | She said she'd {done}. | 01 |
| `if-id-known` | If I'd known, I would have {done}. | 02 |
| `if-i-hadnt` | If I hadn't {done}, I wouldn't have {result}. | 02 |
| `i-should-have` | I should have {done}. | 02 |
| `you-shouldnt-have` | You shouldn't have {done}. | 02 |
| `i-wish-id` | I wish I'd {done}. | 02 |
| `if-only` | If only {wish}! | 02 |
| `im-convinced-that` | I'm convinced that {opinion}. | 03 |
| `theres-no-doubt-that` | There's no doubt that {fact}. | 03 |
| `i-see-your-point-but` | I see your point, but {counter}. | 03 |
| `the-problem-with-is` | The problem with {thing} is that {problem}. | 03 |
| `its-reported-that` | It's reported that {news}. | 04 |
| `is-expected-to` | {subject} is expected to {do}. | 04 |
| `i-had-my` | I had my {thing} {done}. | 04 |
| `where-can-i-get` | Where can I get my {thing} {done}? | 04 |
| `has-risen-by` | {thing} has risen by {amount}. | 04 |
| `im-writing-to` | I'm writing to {purpose}. | 05 |
| `could-you-let-me-know` | Could you let me know {question}? | 05 |
| `id-suggest` | I'd suggest {doing}. | 05 |
| `would-it-be-possible-to` | Would it be possible to {do}? | 05 |
| `id-love-to-but` | I'd love to, but {reason}. | 05 |
| `what-if-we` | What if we {do}? | 05 |
| `my-who` | My {person}, who {info}, is coming to visit. | 06 |
| `i-bought-which` | I bought {thing}, which {info}. | 06 |
| `which-means` | {fact}, which means {result}. | 06 |
| `which-is-why` | {fact}, which is why {result}. | 06 |
| `the-place-where` | This is the place where {event}. | 06 |
| `a-friend-whose` | I have a friend whose {relative} {info}. | 06 |
| `ill-never-forget-the-day` | I'll never forget the day when {event}. | 06 |
| `this-time-tomorrow` | This time tomorrow, I'll be {doing}. | 07 |
| `will-you-be` | Will you be {doing}? | 07 |
| `ill-have-by` | I'll have {done} by {time}. | 07 |
| `is-likely-to` | {subject} is likely to {do}. | 07 |
| `i-doubt` | I doubt {prediction}. | 07 |
| `ive-run-out-of` | I've run out of {thing}. | 08 |
| `we-need-to-come-up-with` | We need to come up with {idea}. | 08 |
| `could-you-it-please` | Could you {verb} it {particle}, please? | 08 |
| `i-cant-put-up-with` | I can't put up with {thing} any more. | 08 |
| `youre-not-supposed-to` | You're not supposed to {do}. | 09 |
| `i-was-supposed-to` | I was supposed to {do}, but {reason}. | 09 |
| `are-we-allowed-to` | Are we allowed to {do}? | 09 |
| `they-dont-let-us` | They don't let us {do}. | 09 |
| `is-it-ok-if` | Is it OK if I {do}? | 09 |
| `i-neednt-have` | I needn't have {done}. | 09 |
| `whats-the-point-of` | What's the point of {doing}? | 09 |
| `not-only-but-also` | It's not only {first}, but also {second}. | 10 |
| `has-led-to` | {cause} has led to {result}. | 10 |
| `the-first-step-is` | The first step is to {do}. | 10 |
| `the-article-says` | The article says that {claim}. | 10 |
| `suppose-you` | Suppose you {did}. What would you do? | 11 |
| `what-if-happened` | What if {event}? | 11 |
| `id-rather-you` | I'd rather you {did}. | 11 |
| `its-time-we` | It's time we {did}. | 11 |
| `if-id-now` | If I'd {done}, I'd {result} now. | 11 |
| `if-i-werent` | If I weren't {state}, I would have {done}. | 11 |
| `its-the-feeling-when` | It's the feeling you get when {situation}. | 12 |
| `it-has-to-do-with` | It has to do with {topic}. | 12 |
| `not-exactly-more-like` | It's not exactly {near}, more like {closer}. | 12 |
| `what-im-trying-to-say` | What I'm trying to say is {point}. | 12 |
| `what-i-meant-was` | What I meant was {point}. | 12 |
| `coming-back-to` | Coming back to {topic}, {point}. | 12 |
| `another-thing-is` | Another thing is that {point}. | 12 |
| `take-for-example` | Take {example}, for example. | 12 |

### Ngữ pháp (GRAMMAR)

| Item | Điểm ngữ pháp | Unit |
|---|---|---|
| `past-perfect` | had + V3: việc xảy ra trước một mốc khác trong quá khứ | 01 |
| `narrative-tenses` | quá khứ đơn, quá khứ tiếp diễn, quá khứ hoàn thành (tiếp diễn) trong một câu chuyện | 01 |
| `reported-speech-advanced` | lùi thì đầy đủ: hiện tại hoàn thành / quá khứ đơn → quá khứ hoàn thành; đổi từ chỉ thời gian, nơi chốn | 01 |
| `third-conditional` | If + had + V3, would have + V3 | 02 |
| `should-have` | should have / shouldn't have / could have + V3 | 02 |
| `wish-past-perfect` | I wish / If only + had + V3 | 02 |
| `making-a-case` | nêu luận điểm (I'm convinced that, There's no doubt that, It's clear that) + lý lẽ (First of all, What's more, For example) | 03 |
| `contrast-concession` | although / even though + mệnh đề; despite / in spite of + danh từ / V-ing; whereas; however; even so | 03 |
| `generalizing` | tend to + V, on the whole, in general, most people, generally speaking | 03 |
| `passive-reporting` | It is said / reported / expected that…; X is said / believed / expected to + V | 04 |
| `have-something-done` | have / get + vật + V3 | 04 |
| `describing-trends` | rise / increase / go up, fall / decrease / go down + by / to / from … to; a sharp / slight rise | 04 |
| `formal-email` | khung email công việc: chào, I'm writing to…, Please find attached, Could you…?, I look forward to hearing from you | 05 |
| `making-suggestions` | I'd suggest + V-ing / that…; Would it be possible to + V?; Why don't we / Let's | 05 |
| `softening-refusals` | từ chối khéo: làm mềm (I'd love to, but… / I'm afraid…) + lý do + phương án khác (What if we…?) | 05 |
| `non-defining-relative` | …, who / which …, : thông tin phụ có dấu phẩy, không dùng that | 06 |
| `which-whole-clause` | …, which means / which is why / which was + tính từ: which thay cho cả mệnh đề | 06 |
| `whose-where-when` | whose + danh từ; where / when + mệnh đề | 06 |
| `future-continuous` | will be + V-ing: sẽ đang làm; hỏi kế hoạch lịch sự | 07 |
| `future-perfect` | will have + V3 by …; will have been + V-ing | 07 |
| `future-certainty` | will definitely / is likely to / may well / probably won't / I doubt | 07 |
| `phrasal-verb-basics` | động từ + tiểu từ, nghĩa mới; cụm (nói) ↔ từ trang trọng (viết) | 08 |
| `separable-phrasal-verbs` | tách được (turn it off, đại từ ở giữa) / không tách (look after them) | 08 |
| `three-part-phrasal-verbs` | động từ + tiểu từ + giới từ, không tách (put up with it, break up with sb) | 08 |
| `supposed-to` | be supposed to + V: theo quy định / dự kiến; was supposed to: kế hoạch không thành; is supposed to be: nghe nói | 09 |
| `allowed-to` | be allowed to / let + người + V (không to) / can / may; prohibited, banned trên biển báo | 09 |
| `need-not` | don't have to / needn't (≠ mustn't); didn't need to + V (không làm) / needn't have + V3 (đã làm, hóa ra thừa) | 09 |
| `linking-words` | từ nối đầu câu có dấu phẩy (However, Therefore, In addition, As a result) ↔ but / so / and trong một câu | 10 |
| `cause-effect` | because + mệnh đề; because of / due to + danh từ; lead to / cause / result in + danh từ / V-ing | 10 |
| `describing-a-process` | hiện tại đơn bị động + First / Then / Once + hiện tại / After + V-ing / Finally | 10 |
| `hypothetical-past` | Suppose / What if / Imagine + quá khứ đơn → would; What if + hiện tại khi dễ xảy ra | 11 |
| `id-rather` | would rather + V; would rather + người + quá khứ đơn; It's (high) time + người + quá khứ đơn | 11 |
| `mixed-conditional` | If + had + V3, would + V (now); If + quá khứ đơn (sự thật lâu dài), would have + V3 | 11 |

### Lỗi thường gặp của người Việt (B2)

- "When I arrived, the train already left" (ý là lỡ tàu), dùng had + V3 cho mọi chuyện quá khứ, "I had never saw", "I had been wait", kể chuyện bằng hiện tại đơn, "very exhausted", "At first, open the box", realize hiểu là "thực hiện", "He said he has sent it yesterday", "suggested me to go", "denied to take", "got to there" (unit 01).
- "If I would have known", "If I knew yesterday, I would come", "would have came", "just on time" (ý là vừa kịp), "I should listened", "should have went", viết "should of", "It's my wrong", "I wish I took more photos" (ý là hồi đó), "I wish I would have gone", "do a decision", "Never mind" để đáp lời cảm ơn (unit 02).
- "In my opinion, I think", "I'm convince", "evidences", "an evidence", "Despite it was raining", "despite of", "Although…, but…", "Even though…, but…", "In spite the rain", "The young people tend to…" (nói chung), "tend to using", "affect on", "has an affect", nói tuyệt đối "All Vietnamese people…" (unit 03).
- "According to me", "The storm expects to hit", "It is said the price will to rise", "I cut my hair at the hairdresser's" (ý là thợ cắt), "I had fixed my car" (ý là thuê sửa), "I had my phone repair", "The price has raised", "an increase of traffic", "ten percents", "compare to last year" (unit 04).
- "I want you send me the file", "let me know when are you free", "I look forward to hear from you", "I suggest you to call", "Would it be possible that you send…", "Who is responsible this project?", "No, I'm busy." (cộc), "What if we will…", "a deadline" hiểu là "do the deadline" (unit 05).
- "My mother, that is a teacher, …", "which it was on sale", thiếu dấu phẩy với tên riêng, "…, what means…", "a compensation", "a friend who his father…", "the town where I grew up there", "a history town", "It's worth to visit", "recommend you to try" (unit 06).
- "Tomorrow at 9, I will work in a meeting", "I will be fly", "finish the report until Friday", "By the time you will arrive", "a big progress", "in the end of the month", "I will probably not come", "I doubt prices won't…", "many population" (unit 07).
- "I gave up to smoke", "Turn off it", "pick up me", "fill out it", "look my cat after", "She broke up her boyfriend", "I can't put it up with", "Don't let down me", dùng postpone / discover khi nói chuyện (unit 08).
- "We suppose to…", "The bus supposed to come", "I was supposed to called", "I was punished money" (ý là bị phạt tiền), "We are not allow to…", "lets us to leave", "It is allowed to park here?", "a permission", "You mustn't come" (ý là không cần), "I needn't have hurry", "It's not make sense", "many paperworks" (unit 09).
- "Although…, but…", "Because…, therefore…", "However it was good" (thiếu dấu phẩy), "because of the traffic was bad", "due to it rained", "lead to people get sick", "The flood caused by the rain" (thiếu be), "Then the bottles wash" (thiếu bị động), "Once they will be dry", "At first" để mở đầu quy trình, "The article said that…" khi kể lại một bài vẫn còn đó (unit 10).
- "Suppose if you won", "What if nobody will come?", "in case it will rain", "I'd rather to stay", "I'd rather you don't…", "It's time we make…", "I'd rather don't", "If I studied abroad, I would speak better now" (ý là hồi đó), "…, I would have lived in Singapore now", "fluent with English" (unit 11).
- "In English don't have this word", "It's relate to…", "My mean is…", "Where am I?" (ý là đang nói đến đâu), xin lỗi liên tục rồi im lặng thay vì sửa và nói tiếp, "I'm not finish!", "For example is my sister", trả lời một chữ rồi dừng (unit 12).

### Ghi chú B2

- `b2-01`: `past-perfect` và `narrative-tenses` tách hai GRAMMAR: bài 1 chỉ had + V3, bài 2 gom cả bốn thì kể chuyện và had been + V-ing. `reported-speech-advanced` nối tiếp `reported-speech` (B1 09): phần lùi hiện tại hoàn thành / quá khứ đơn → had + V3 mà B1 để lại. `suggest` (+ V-ing) nằm ở đây vì hay dùng khi tường thuật.
- `b2-02`: `should-have` (lẽ ra) phân biệt với `must-have-done` (đoán, B1 11) trong EXPLAIN bài 2. `wish-past-perfect` nối tiếp `i-wish` (B1 06). `learned-my-lesson` viết kiểu Mỹ learned. `just-in-time` phân biệt với `on-time` (B1 05) trong `noteVi`.
- `b2-03` là mốc stage (canDo thứ ba). `because`, `although`, `giving-opinions`, `on-the-other-hand`, `good-point` (B1) chỉ RECYCLE. `despite`, `whereas`, `admittedly` là LEXICAL; `even-though`, `even-so` là PHRASE. First of all, Besides, Moreover chỉ nằm trong ví dụ, `noteVi`.
- `b2-04`: `passive-reporting` nối tiếp bị động B1 08. `have-something-done` cũng gồm nghĩa "bị" (had my bag stolen), RECYCLE `my-was-stolen`. fall / drop / go down chỉ nằm trong `describing-trends`; `rise`, `increase`, `decrease` là LEXICAL. Hội thoại sửa điện thoại đổi cảnh giữa chừng (tiệm → nhà) để luyện kể lại bằng have something done.
- `b2-05`: `look-forward-to` (B1 10), `polite-requests`, `would-you-mind`, `im-afraid` (B1 07), `suggest` (B2 01), `the-point-is` (B1 12), `id-love-to` (A2 04) chỉ RECYCLE. `id-suggest` nối tiếp `suggest` (+ V-ing); `id-love-to-but` nối tiếp `id-love-to`. `could-you-let-me-know` dạy câu hỏi gián tiếp trong email (trật tự câu kể, if / whether). `on-short-notice` viết kiểu Mỹ (Anh: at short notice). `postpone` đứng ở đây, bản nói thường `put-off` ở B2 08.
- `b2-06`: `non-defining-relative` nối tiếp `relative-clauses` / `the-person-who` (A2 11, mệnh đề xác định), EXPLAIN bài 1 đặt hai loại cạnh nhau. `whose` (B1 11, từ để hỏi) chỉ RECYCLE; `whose-where-when` dạy whose làm từ nối. `the-place-where` khác `its-a-place-where` (A1 10, định nghĩa). Ví dụ `which-whole-clause` phân biệt which thay danh từ và which thay cả việc (I lost my phone, which was new / which was a disaster).
- `b2-07`: `future-continuous` đặt cạnh `past-continuous` (B1 02); `future-perfect` nối tiếp `by-the-time` (B2 01) và phân biệt by / `until` (B1 05) trong EXPLAIN bài 2. will have been + V-ing chỉ nằm trong `forms`, không có item riêng. `future-certainty` nối tiếp `will-future`, `probably`, `definitely` (B1 03). AI chỉ nằm trong `noteVi` của `automation` và hội thoại.
- `b2-08`: 15 PHRASE (cụm động từ) và chỉ 2 LEXICAL. `turn-off`, `get-up`, `check-in`, `look-for`, `hurry-up`, `get-along-with`, `look-forward-to` (đã có) chỉ RECYCLE, dùng làm ví dụ cho quy tắc tách trong EXPLAIN bài 2 và 3. `run out of`, `come up with`, `put up with` chỉ có dạng PATTERN (`ive-run-out-of`, `we-need-to-come-up-with`, `i-cant-put-up-with`), không có PHRASE riêng. `fill-out` viết kiểu Mỹ (Anh: fill in). `catch-up-with` gồm cả catch up không tân ngữ.
- `b2-09`: `have-to`, `should-shouldnt`, `can-ability`, `do-you-have-to` (A2), `should-have` (B2 02) chỉ RECYCLE; EXPLAIN bài 1 đặt have to / should / be supposed to cạnh nhau, bài 2 phân biệt not allowed to (cấm hẳn) với not supposed to (có quy định nhưng người ta vẫn làm). `fine-penalty` là slug của fine (tiền phạt) để khỏi lẫn với fine (khỏe). `is-it-ok-if` là mức xin phép thân mật, nối với `would-it-be-possible-to` (B2 05). `need-not` gồm cả mustn't để đối chiếu; `i-neednt-have` ghi chú kiểu Mỹ didn't have to.
- `b2-10`: `because`, `although`, `whats-more`, `on-the-other-hand`, `which-means`, `sequencing`, `according-to`, `passive-present` chỉ RECYCLE. `on-top-of-that` (để dành từ P4-6b) là bản thân mật của `in-addition`. `describing-a-process` dạy once = ngay khi, phân biệt `once` (A2 09, một lần) trong `ruleVi`; không có item once riêng. `the-article-says` dùng hiện tại đơn, đối chiếu với lùi thì của `reported-speech` (B1 09). Moreover, Furthermore, In short chỉ nằm trong `noteVi`.
- `b2-11`: `hypothetical-past` nối tiếp `second-conditional`, `imagine`, `what-would-you-do-if` (B1 06) và phân biệt với `what-if-we` (B2 05, đề nghị + hiện tại) trong EXPLAIN bài 1. `id-rather` đặt cạnh `prefer` (A2 08) và `its-time` (A1 02, It's time to + V). `mixed-conditional` nối tiếp `third-conditional`, `wish-past-perfect` (B2 02); bảng EXPLAIN bài 3 đặt loại 3 và hai kiểu hỗn hợp cạnh nhau. Hội thoại họp lớp dùng tên Minh (không ngầm định giới tính người học).
- `b2-12` giống `b1-12`: không GRAMMAR, mỗi bài 8 INTRODUCE đều vào INTRO, canDo thứ tư tổng kết B2, checkpoint 8 câu có 2 câu ôn (`third-conditional`, `non-defining-relative`). `how-can-i-put-it`, `whats-the-word`, `its-a-kind-of`, `in-other-words`, `i-mean`, `let-me-try-again`, `as-i-was-saying`, `sorry-to-interrupt`, `to-sum-up`, `for-example` chỉ RECYCLE. `it-has-to-do-with` viết kiểu Mỹ (Anh: It's to do with). Hội thoại bài 2 giải thích chữ "duyên" cho người Anh, gom diễn đạt vòng (bài 1) và tự sửa (bài 2).
- Stage B2 xong (P4-6c): 12 unit, 36 bài, 288 item, placement 24 câu.

## C1: Advanced

Mốc của stage: "Tôi diễn đạt linh hoạt, tự nhiên" (unit 04). Khung 12 unit (chốt ở P4-7a, user nâng từ 8 lên 12; P4-7a soạn 01–04, P4-7b soạn 05–08, P4-7c soạn 09–12):

| # | Unit | Can-do (tóm tắt) | Bài | Item (L/Ph/Pa/G) | Dialogue | Trạng thái |
|---|---|---|---|---|---|---|
| 1 | `c1-01-to-some-extent` | mức độ (fairly, rather, somewhat, considerably, barely, a bit on the … side, far from), nói tránh (It would seem that, It's fair to say that, to some extent, arguably, presumably, I'd say), nói giảm để chê khéo (not particularly, a bit of a, It could be better, mixed feelings, underwhelming, overrated) | 3 | 24 (9/6/6/3) | 2 | draft |
| 2 | `c1-02-what-i-need-is` | câu chẻ với what (What I need is, What I love about … is, What happened was, All I want is, The thing is), với it (It was … that / who, It's not … that bothers me, it's…, The reason why … is that, The last thing I want is), nhấn mạnh bằng do / did, by far, such a … that, absolutely, whatsoever, no matter what | 3 | 24 (8/2/11/3) | 2 | draft |
| 3 | `c1-03-little-did-i-know` | đảo ngữ sau từ phủ định (Never have I, Rarely do you, Not once did, Under no circumstances), kể chuyện (Little did I know, No sooner had … than, Only then did I, out of the blue, to my surprise), đảo ngữ trang trọng (Not only did, Should you need, Had I known, do not hesitate, further assistance) | 3 | 24 (8/4/9/3) | 2 | draft |
| 4 | `c1-04-idioms` | thành ngữ công sở (on the same page, the ball is in your court, cut corners, get the ball rolling, back to square one, a ballpark figure, touch base), thành ngữ đời sống so với tiếng Việt (a blessing in disguise, beat around the bush, the last straw, once in a blue moon, cost an arm and a leg), cặp từ cố định (sooner or later, ups and downs, by and large, sick and tired of); mốc của stage | 3 | 24 (1/17/3/3) | 2 | draft |
| 5 | `c1-05-presenting` | thuyết trình: mở đầu và dẫn dắt (Today I'll be talking about, I'd like to start by, Let's now turn to, This brings me to, To wrap up, the key takeaway), trình bày số liệu (As you can see, account for, three out of ten, twice as many … as, peak, approximately, To put this into perspective), xử lý câu hỏi (I'll come back to that, I'll get back to you on, off the top of my head, outside the scope, Does that answer your question?, follow-up) | 3 | 24 (4/12/5/3) | 2 | draft |
| 6 | `c1-06-persuading` | thuyết phục và đàm phán: điều kiện (provided that, as long as, on condition that, If you were to…, in return, terms, proposal), nhượng bộ và đổi chác (I'm prepared to, meet someone halfway, the bottom line, That's the best we can do, wiggle room, compromise, deal-breaker), chốt thỏa thuận (So, we've agreed that, Do we have a deal?, put it in writing, Let me sleep on it, a win-win, You have my word) | 3 | 24 (5/12/4/3) | 2 | draft |
| 7 | `c1-07-register` | văn phong: từ trang trọng ↔ thân mật (obtain, assist, commence, inquire, sufficient, purchase, I would be grateful if), danh từ hóa và bị động (There has been a … in, It has been decided that, approval, implementation, reduction, following, prior to), viết lại email bực bội (It appears that, Just a gentle reminder, As per my last email, I appreciate that, tone, blunt, passive-aggressive) | 3 | 24 (12/5/4/3) | 2 | draft |
| 8 | `c1-08-feedback` | góp ý khéo (It might be worth, I wonder if it would help to, One thing you could consider is, Have you thought about, food for thought, constructive, feedback), khen cụ thể (I was really impressed by, You did a great job of, What worked well was, spot on, Keep up the good work, Credit where credit's due, praise), nhận phê bình (Thanks for pointing out, take on board, Point taken, Could you give me an example?, in hindsight, defensive, criticism) | 3 | 24 (6/9/6/3) | 2 | draft |
| 9 | `c1-09-collocations` | collocation tính từ + danh từ (heavy traffic, strong coffee, high prices, a close friend, common sense, a wide range of), make / do / take / pay + danh từ (make a decision, make progress, make an effort, do me a favor, take a break, pay attention to, take full responsibility for), trạng từ + tính từ (bitterly disappointed, highly unlikely, deeply grateful, fully aware, strongly recommend, utterly, painfully); tránh dịch từng chữ | 3 | 24 (3/13/5/3) | 2 | draft |
| 10 | `c1-10-trends` | bình luận xu hướng: tương lai kiểu C1 (be bound to, be set to, be on the verge of, It's only a matter of time before, for the foreseeable future, inevitable, widespread), mệnh đề phân từ (Having + V3, Given that, Faced with, Judging by, considering; remote work, lifestyle), dẫn nguồn và số liệu (A recent study found that, Research suggests that, A growing number of, the vast majority of, take it with a grain of salt, statistics, reportedly) | 3 | 24 (6/7/8/3) | 2 | draft |
| 11 | `c1-11-between-the-lines` | hiểu hàm ý: câu lịch sự nói một đằng hiểu một nẻo (I'll bear it in mind, With respect, You might want to, I hear what you say, That's an interesting idea, read between the lines, imply), mỉa mai và đùa (That's just what I needed, I'm only joking, Very funny, Are you pulling my leg?, Don't tell me, sarcastic, a sense of humor), small talk (câu hỏi đuôi tìm đồng tình, Tell me about it, Can't complain, What brings you here?, small talk, awkward) | 3 | 24 (3/13/5/3) | 2 | draft |
| 12 | `c1-12-strategy` | chiến lược C1: diễn giải và tóm tắt (If I understand you correctly, So what you're saying is that, Am I right in thinking that, Correct me if I'm wrong, but, To recap, In essence, gist, paraphrase), phản đối tinh tế (I take your point, but, I see it a bit differently, I wouldn't go that far, That's one way of looking at it, play devil's advocate, Let's agree to disagree, valid, nuance), câu hỏi khó và kết thúc (That's a tricky one, The short answer is, I'd rather not go into, I should let you go, I won't keep you, It's been great catching up, Let's pick this up another time, diplomatic); can-do tổng kết C1 và cả lộ trình | 3 | 24 (5/12/7/0) | 2 | draft |

### Mẫu câu (PATTERN)

| Item | Template | Unit |
|---|---|---|
| `its-a-bit-on-the-side` | It's a bit on the {adjective} side. | 01 |
| `it-would-seem-that` | It would seem that {claim}. | 01 |
| `its-fair-to-say` | It's fair to say that {claim}. | 01 |
| `id-say` | I'd say {estimate}. | 01 |
| `a-bit-of-a` | It was a bit of a {noun}. | 01 |
| `not-particularly` | It's not particularly {adjective}. | 01 |
| `what-i-need-is` | What I need is {thing}. | 02 |
| `what-i-love-about` | What I love about {thing} is {reason}. | 02 |
| `what-happened-was` | What happened was that {event}. | 02 |
| `all-i-want-is` | All I want is {thing}. | 02 |
| `it-was-that` | It was {focus} that {rest}. | 02 |
| `its-not-its` | It's not {first} that bothers me, it's {second}. | 02 |
| `the-reason-why` | The reason why {fact} is that {reason}. | 02 |
| `the-last-thing` | The last thing I want is {thing}. | 02 |
| `i-do-think` | I do think {opinion}. | 02 |
| `by-far-the` | It's by far the {superlative} I've ever {done}. | 02 |
| `such-a-that` | It was such a {noun} that {result}. | 02 |
| `never-have-i` | Never have I {done}. | 03 |
| `rarely-do` | Rarely do you {do} these days. | 03 |
| `not-once-did` | Not once did {person} {do}. | 03 |
| `little-did-i-know` | Little did I know that {twist}. | 03 |
| `no-sooner-had` | No sooner had I {done} than {event}. | 03 |
| `only-then-did` | Only then did I realize {fact}. | 03 |
| `not-only-did` | Not only did {first}, but {second}. | 03 |
| `should-you-need` | Should you need {thing}, please let us know. | 03 |
| `had-i-known` | Had I known {fact}, I would have {done}. | 03 |
| `lets-touch-base` | Let's touch base {time}. | 04 |
| `cost-an-arm-and-a-leg` | {thing} cost me an arm and a leg. | 04 |
| `sick-and-tired` | I'm sick and tired of {doing}. | 04 |
| `id-like-to-start-by` | I'd like to start by {doing}. | 05 |
| `lets-turn-to` | Let's now turn to {topic}. | 05 |
| `as-you-can-see` | As you can see, {observation}. | 05 |
| `to-put-this-into-perspective` | To put this into perspective, {comparison}. | 05 |
| `ill-get-back-to-you-on` | I'll get back to you on {topic}. | 05 |
| `provided-that` | We can {offer}, provided that {condition}. | 06 |
| `if-you-were-to` | If you were to {do}, we could {offer}. | 06 |
| `im-prepared-to` | I'm prepared to {concession}. | 06 |
| `so-weve-agreed` | So, we've agreed that {terms}. | 06 |
| `i-would-be-grateful-if` | I would be grateful if you could {action}. | 07 |
| `there-has-been-a` | There has been a {change} in {thing}. | 07 |
| `it-has-been-decided` | It has been decided that {decision}. | 07 |
| `it-appears-that` | It appears that {problem}. | 07 |
| `it-might-be-worth` | It might be worth {doing}. | 08 |
| `i-wonder-if` | I wonder if it would help to {do}. | 08 |
| `one-thing-you-could-consider` | One thing you could consider is {doing}. | 08 |
| `i-was-impressed-by` | I was really impressed by {thing}. | 08 |
| `you-did-a-great-job-of` | You did a great job of {doing}. | 08 |
| `thanks-for-pointing-out` | Thanks for pointing out {problem}. | 08 |
| `a-wide-range-of` | There's a wide range of {things}. | 09 |
| `pay-attention-to` | Please pay attention to {thing}. | 09 |
| `take-responsibility-for` | I take full responsibility for {thing}. | 09 |
| `deeply-grateful` | I'm deeply grateful for {thing}. | 09 |
| `fully-aware` | I'm fully aware that {fact}. | 09 |
| `be-bound-to` | {thing} is bound to {happen}. | 10 |
| `be-set-to` | {thing} is set to {change}. | 10 |
| `having-finished` | Having {done}, {result}. | 10 |
| `given-that` | Given that {fact}, {conclusion}. | 10 |
| `faced-with` | Faced with {problem}, {reaction}. | 10 |
| `a-recent-study` | A recent study found that {finding}. | 10 |
| `research-suggests` | Research suggests that {finding}. | 10 |
| `a-growing-number-of` | A growing number of {people} are {doing}. | 10 |
| `with-respect` | With respect, {opinion}. | 11 |
| `you-might-want-to` | You might want to {do}. | 11 |
| `dont-tell-me` | Don't tell me {news}. | 11 |
| `isnt-it` | It's {comment}, isn't it? | 11 |
| `havent-you` | You've {done} before, haven't you? | 11 |
| `if-i-understand-you-correctly` | If I understand you correctly, {paraphrase}. | 12 |
| `so-what-youre-saying-is` | So what you're saying is that {paraphrase}. | 12 |
| `am-i-right-in-thinking` | Am I right in thinking that {assumption}? | 12 |
| `i-take-your-point` | I take your point, but {counter}. | 12 |
| `i-see-it-differently` | I see it a bit differently. For me, {view}. | 12 |
| `the-short-answer-is` | The short answer is {answer}. | 12 |
| `id-rather-not-go-into` | I'd rather not go into {topic}. | 12 |

### Ngữ pháp (GRAMMAR)

| Item | Điểm ngữ pháp | Unit |
|---|---|---|
| `degree-adverbs` | fairly / quite / rather / pretty / somewhat + tính từ; slightly / considerably / far + so sánh hơn; barely | 01 |
| `hedging` | may / might / could, seem / appear, It would seem that, arguably, to some extent, I'd say | 01 |
| `understatement` | not + very / particularly / entirely + từ tích cực; a bit of a + danh từ; It could be better | 01 |
| `wh-cleft` | What + mệnh đề + is / was + phần nhấn; All I want is…; The thing is… | 02 |
| `it-cleft` | It is / was + phần nhấn + that / who…; It's not X that…, it's Y; The reason why … is that… | 02 |
| `emphatic-do` | do / does / did + V nguyên mẫu; by far + so sánh nhất; such a … that; absolutely + tính từ mạnh | 02 |
| `negative-inversion` | Never / Rarely / Seldom / Not once / Under no circumstances + trợ động từ + S + V | 03 |
| `time-inversion` | Little did I know…; No sooner had … than / Hardly had … when; Only then / Only when … did… | 03 |
| `conditional-inversion` | Should you + V; Had I + V3; Were I to + V; Not only did …, but… | 03 |
| `idiom-basics` | thành ngữ là cụm cố định: không thay từ, chỉ chia động từ / đổi đại từ; mức trang trọng | 04 |
| `idioms-and-vietnamese` | thành ngữ Anh có nghĩa gần thành ngữ Việt nhưng hình ảnh khác; không dịch từng chữ thành ngữ Việt | 04 |
| `fixed-binomials` | cặp từ cố định A and / or B, không đảo thứ tự (sooner or later, ups and downs, by and large) | 04 |
| `signposting` | cụm dẫn dắt thuyết trình: Today I'll be talking about…, I'd like to start by + V-ing, Let's now turn to…, This brings me to…, To wrap up… | 05 |
| `describing-data` | As you can see…, account for, X out of Y, twice as many / much … as, peak, approximately, To put this into perspective… | 05 |
| `handling-questions` | đón câu hỏi, hoãn (I'll come back to that), chưa biết (I'll get back to you on…), lạc đề, kiểm tra (Does that answer your question?) | 05 |
| `negotiation-conditionals` | provided that / as long as / on condition that + hiện tại; If you were to + V, … could / would; in return | 06 |
| `concessions-trade-offs` | I'm prepared to + V + điều kiện; meet halfway; That's the best we can do; the bottom line; deal-breaker | 06 |
| `closing-a-deal` | So, we've agreed that… (hiện tại hoàn thành); Do we have a deal?; put it in writing; Let me sleep on it | 06 |
| `formal-informal-vocab` | từ gốc Latin ↔ từ ngắn / cụm động từ: obtain ↔ get, assist ↔ help, commence ↔ start, inquire ↔ ask, require ↔ need | 07 |
| `nominalization` | động từ → danh từ (-tion, -al, -ment) + bị động bỏ người làm: There has been a reduction in…, It has been decided that…; following, prior to | 07 |
| `softening-tone` | nói về sự việc thay vì trách người, It appears that…, I appreciate that…, but…, gentle reminder; nhận ra câu passive-aggressive | 07 |
| `tactful-feedback` | It might be worth + V-ing, I wonder if it would help to + V, One thing you could consider is + V-ing, Have you thought about + V-ing? | 08 |
| `specific-praise` | I was impressed by + N / how…, You did a great job of + V-ing, What worked well was…, Credit where credit's due | 08 |
| `responding-to-criticism` | cảm ơn → hỏi rõ → nhận phần đúng (Point taken, In hindsight, I should have…) → nói việc sẽ làm (take on board) | 08 |
| `collocations` | cặp tính từ + danh từ cố định (heavy traffic / rain, strong coffee, high prices, a close friend); không thay bằng từ đồng nghĩa | 09 |
| `make-do-take` | make (tạo ra: decision, progress, effort), do (việc: homework, research, a favor), take (break, responsibility), pay (attention) | 09 |
| `adverb-collocations` | trạng từ đi đôi với tính từ: bitterly disappointed, highly unlikely, deeply grateful, fully aware, utterly exhausted, painfully slow | 09 |
| `future-expressions` | be bound to + V (chắc chắn), be set to + V (đã dự kiến), be on the verge of + V-ing (sắp), It's only a matter of time before + hiện tại | 10 |
| `participle-clauses` | Having + V3, …; Faced with + N, …; Given that…, …; Judging by…; considering; chủ ngữ ngầm = chủ ngữ vế chính | 10 |
| `citing-sources` | According to…, A recent study found that…, Research suggests that… (research không đếm được), the vast majority of, reportedly; According to me ✗ | 10 |
| `polite-code` | nghĩa thật: I'll bear it in mind (chắc không), With respect (phản đối), I hear what you say, That's an interesting idea, You might want to (yêu cầu) | 11 |
| `sarcasm-irony` | mỉa mai về chuyện xui (Lovely weather!, That's just what I needed), đáp cùng giọng; I'm only joking, Very funny, pull someone's leg | 11 |
| `tag-questions` | câu hỏi đuôi xuống giọng tìm đồng tình: trợ động từ + đại từ, khẳng định ↔ phủ định; I'm → aren't I, Let's → shall we | 11 |

### Lỗi thường gặp của người Việt (C1)

- "very very good" cho mọi mức, "I didn't barely sleep", "considerably cheap", "It is sure that…", "In some extent", "It's a bit of disaster", nói thẳng "The food was bad" với chủ nhà, "over-evaluated" (ý là overrated), hiểu "Not bad!" là chê (unit 01).
- "What I need it is…", "The thing what I love is…", "All I want are…", "It was Lan found the mistake", "The reason why … is because…", "emphasize on", "I did called you", "so a long day", "very delicious" (unit 02).
- "Never I have seen…", "Not once he said…", "Not once did he said…", "Seldom I go…", "No sooner I sat down, …", "No sooner … when…", "Little I knew…", "Only then I realized…", "If had I known…", "Should you needed…", "your assistances" (unit 03).
- "on the same paper", "cut the corner", "start again from zero" (ý là back to square one), "the last drop of water" (dịch từ giọt nước tràn ly), "go around the bush", dịch nguyên văn thành ngữ Việt ("a frog in a well"), "later or sooner", "cons and pros", "sick and tired to wait", dồn nhiều thành ngữ vào một câu (unit 04).
- "Now I will present about…", "Next is the part of…", "Online occupies 60 percent", "3 in 10 of customers", "two times more many", bịa số khi không biết, "I will answer you later", "Do you understand?" với người hỏi (unit 05).
- "provided that you will order", "If you would sign today…" (ý là If you were to), "meet in the half", "take it or leave it", "So we agree that…" khi tóm lại, gật đầu cho xong rồi đổi ý (unit 06).
- "I will assist you to obtain tickets" khi nhắn bạn bè, "inquire you about", trộn từ hai văn phong, "a reduce in costs", "prior to leave", "It has decided that…", "You made a mistake AGAIN!!!", "Why you still not reply?", tưởng "As per my last email" là lịch sự (unit 07).
- "You should change this. It's wrong.", "worth to add", "a feedback", "Good job, very good, very good", "impressed with your present", "a great job to explain", giải thích ngay khi bị chê, "take it on my board", "In hindsight, I should check" (unit 08).
- "big rain", "big traffic", "thick coffee", "expensive price", "near friend", "a common sense", "do a decision", "make homework", "make a break", "take attention", "strongly disappointed", "highly grateful", "very exhausted", "I'm full aware" (unit 09).
- "It is bound that…", "on the verge to close", "before it will happen", "Having finish…", "Facing with…", chủ ngữ ngầm sai ("Having finished the report, my boss called me"), "According to me", "a research", "Researches suggest", "The majority of people thinks" (unit 10).
- Tưởng "I'll bear it in mind" là hứa làm, tưởng "With respect" là khen, "bear it on mind", đáp "No, it's raining!" khi bị mỉa mai, "Are you joke me?", "I'm just joke", tưởng "Very funny" là khen, "isn't it?" cho mọi câu hỏi đuôi, "It's cold, isn't?", "Why are you here?" ở hội thảo, hiểu "Tell me about it" là "kể đi" (unit 11).
- "You mean what?", gật đầu dù không chắc hiểu, "No, that's wrong" / "You don't understand" khi phản đối, im lặng cho qua rồi bực trong lòng, "I don't want to answer", "It's not your business", "I must go now. Bye.", "We talk again later" (unit 12).

### Ghi chú C1

- `c1-01`: `rather-degree` là slug của rather (khá là) để khỏi lẫn với `id-rather` và `or-rather` (quy ước hậu tố nghĩa, DECISIONS). `slightly`, `much-better`, `kind-of`, `totally`, `seem`, `apparently`, `generalizing`, `i-might-be-wrong-but`, `im-not-so-sure`, `frankly`, `i-see-your-point-but` chỉ RECYCLE. pretty, quite chỉ nằm trong EXPLAIN và `forms` (quite khác nhau giữa Anh và Mỹ, không làm item riêng). `understatement` dạy cả phần nghe hiểu: "Not bad!" là khen, "It's not great" là chê.
- `c1-02`: 11 PATTERN vì câu chẻ là khung câu. `the-point-is`, `what-im-trying-to-say` (B1 12, B2 12), `the-main-reason` (B1 04), `superlatives` (A2 08) chỉ RECYCLE. `emphatic-do` gồm cả tính từ mạnh (absolutely + delicious, không very); `absolutely`, `incredibly` là LEXICAL. Hội thoại bài 2 là sửa hiểu lầm (câu chẻ với it), bài 3 là lời chia tay đồng nghiệp.
- `c1-03`: `negative-inversion` nối tiếp `ive-never` (A2 09); `time-inversion` dùng `past-perfect` (B2 01); `conditional-inversion` nối tiếp `third-conditional`, `if-id-known` (B2 02), `formal-email` (B2 05), `not-only-but-also` (B2 10). EXPLAIN nhắc rằng đảo ngữ khi tán gẫu nghe kịch. Hội thoại bài 3 người học đóng vai quản lý khách sạn (như `b1-07`), lời thoại tiếng Việt không ngầm định giới tính người học.
- `c1-04` là mốc stage (canDo thứ ba). 17 PHRASE (thành ngữ) và 1 LEXICAL (`idiomatic`), như `b2-08` với cụm động từ. `pros-and-cons`, `on-the-whole` (B2 03), `rip-off` (B2 04), `i-cant-put-up-with` (B2 08), `to-make-matters-worse` (B2 06) chỉ RECYCLE. Chỉ chọn thành ngữ còn phổ biến (không raining cats and dogs). `beat-around-the-bush`, `ballpark-figure`, `touch base` theo kiểu Mỹ. Hội thoại bài 2 dùng thành ngữ công sở của bài 1, hội thoại bài 3 gom thành ngữ đời sống và cặp từ.
- `c1-05`: `lets-move-on`, `agenda`, `the-first-step-is`, `to-sum-up`, `describing-trends`, `has-risen-by`, `percent`, `compared-to`, `thats-a-good-question`, `elaborate`, `if-i-could-just-finish`, `perspective` chỉ RECYCLE. `roughly` (B2 12) chỉ nằm trong EXPLAIN và hội thoại; `approximately` là bản trang trọng. `x-out-of-y` là slug của … out of …. `key-takeaway` ghi chú nghĩa đồ ăn mang về kiểu Anh. Hội thoại bài 2 là báo cáo quý với trưởng phòng, bài 3 là phần hỏi đáp ở hội thảo.
- `c1-06`: `first-conditional`, `unless`, `would-it-be-possible-to`, `making-suggestions`, `softening-refusals`, `i-see-your-point-but`, `contrast-concession`, `ballpark-figure`, `on-the-same-page`, `ball-in-your-court`, `making-a-case`, `formal-email` chỉ RECYCLE. `if-you-were-to` là điều kiện loại 2 dạng thăm dò, nối với đảo ngữ Were you to (C1 03). `wiggle-room` kiểu Mỹ (Anh: room for manoeuvre). Hội thoại bài 2 đàm phán giá với nhà cung cấp, bài 3 chốt thỏa thuận và xin thời gian.
- `c1-07`: 12 LEXICAL vì bài 1 là cặp từ trang trọng ↔ thân mật và bài 2 là danh từ hóa. `regarding` (B2 05), `should-you-need` (C1 03), `figure-out` (B2 08), `formal-email`, `passive-present`, `due-to`, `linking-words`, `understatement`, `softening-refusals`, `polite-requests` chỉ RECYCLE; `assist`, `i-would-be-grateful-if` được RECYCLE ngay trong unit. `inquire` viết kiểu Mỹ (Anh: enquire). require chỉ nằm trong EXPLAIN. `as-per-my-last-email` dạy để nghe ra ý bực, không để dùng. Hội thoại bài 2 sửa thông báo gửi khách, bài 3 sửa email bực bội của đồng nghiệp.
- `c1-08`: `understatement`, `making-suggestions`, `id-suggest`, `im-not-entirely-convinced`, `wh-cleft`, `emphatic-do`, `absolutely`, `point-out`, `should-have`, `i-see-your-point-but` chỉ RECYCLE. Không có item I'll bear it in mind: để dành cho `c1-11`. `feedback` ghi chú không đếm được. Hội thoại bài 2 người học góp ý cho đồng nghiệp mới, bài 3 người học nhận góp ý từ trưởng nhóm.
- `c1-09`: collocation chủ yếu là PHRASE (13), như thành ngữ ở `c1-04`. `traffic` (B1 01), `best-friend` (A2 11), `do-homework`, `take-a-shower` (A1 07), `make-the-most-of` (B2 02), `decision` (B2 02), `idiom-basics`, `idioms-and-vietnamese`, `absolutely`, `incredibly`, `degree-adverbs`, `totally` chỉ RECYCLE. heavy rain, a traffic jam, do research, make a mistake chỉ nằm trong EXPLAIN / `forms`. `do-me-a-favor` viết kiểu Mỹ (Anh: favour). Hội thoại bài 2 gấp rút trước ngày ra mắt sản phẩm, bài 3 trượt thăng chức và cảm ơn người hướng dẫn.
- `c1-10`: `in-the-long-run` đã có ở B2 07 nên chỉ RECYCLE (cùng `trend`, `is-likely-to`, `future-certainty`); `having-said-that`, `generation`, `social-media`, `according-to`, `survey`, `describing-trends`, `has-risen-by` chỉ RECYCLE. `matter-of-time` là slug của It's only a matter of time before…. `grain-of-salt` kiểu Mỹ (Anh: a pinch of salt). `citing-sources` sửa lỗi "According to me". Hội thoại bài 2 là podcast về làm việc từ xa, bài 3 kiểm chứng một bài báo lan truyền.
- `c1-11`: `polite-code` là chiều nghe của `understatement`, `hedging` (C1 01); `not-particularly`, `im-not-entirely-convinced` chỉ RECYCLE. `ill-bear-it-in-mind` để dành từ `c1-08`; kiểu Mỹ I'll keep that in mind chỉ nằm trong `noteVi`. `tone`, `passive-aggressive`, `blunt` (C1 07), `funny` (A2 11), `weather` (A1 08), `catch-up-with` (B2 08), `keep-in-touch` (A2 12) chỉ RECYCLE. `sense-of-humor` viết kiểu Mỹ. Hội thoại bài 2 đồng nghiệp người Anh hay đùa, bài 3 bắt chuyện ở giờ nghỉ hội thảo.
- `c1-12` giống `b1-12`, `b2-12`: không GRAMMAR, mỗi bài 8 INTRODUCE đều vào INTRO, canDo thứ tư tổng kết C1 và cả lộ trình, checkpoint 8 câu có 2 câu ôn (`wh-cleft`, `negative-inversion`). `in-other-words`, `let-me-make-sure`, `summarize`, `to-sum-up`, `i-see-your-point-but`, `its-fair-to-say`, `hedging`, `fair-enough`, `thats-a-good-question`, `how-can-i-put-it`, `handling-questions`, `nice-talking-to-you` chỉ RECYCLE. `paraphrase` (nói lại ý người khác) phân biệt với `rephrase` (B2 12, tự nói lại câu mình). Hội thoại bài 2 tranh luận với bạn Mỹ về AI dịch thuật, bài 3 gặp lại đồng nghiệp cũ hỏi chuyện riêng rồi chào tạm biệt.
- Stage C1 xong (P4-7c): 12 unit, 36 bài, 288 item, placement 24 câu. Cả lộ trình: 64 unit, 193 bài, 1552 item, placement 128 câu.

