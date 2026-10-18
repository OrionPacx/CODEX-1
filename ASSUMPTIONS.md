# Decisions and assumptions

The approved Day files remain the source of truth. The following implementation choices are visible in the app and require confirmation where marked.

1. Five teams are used at 35 or fewer students; six are used above 35. The user can override this between four and eight teams.
2. At five teams, the default Day 1 Campus Quest station to drop is Stop 5, Sports complex. This is an implementation default and should be confirmed.
3. Tasting portions use `students + 35 visitors`, so the Day 2 default is 80 at 45 students. The visitor count is editable; it is not a quote or attendance commitment.
4. Day 3 swaps only breakfast through afternoon rest. Day 4/5 evening bookings stay on their original day.
5. The Day 3/Day 4 carry-over inconsistency is resolved as follows: rocket carry-over moves to Day 5 afternoon; the Moon carry-over remains Day 4 night, because the swap rule says evenings never move.
6. The timing engine keeps existing gaps until a change reaches them, then cascades movable blocks. Fixed and anchored commitments retain their start time; resulting conflicts are shown for management review.
7. Substitute Events are added suggestions only. They do not claim a venue, equipment, person, price, permission or booking; every card says to confirm resources.
8. Day 6 is presented as management-run and intentionally has no editable minute-by-minute timeline.
9. The generated Open Graph illustration is an original generic visual. It has no university logo, real person or official branding.
10. Original references such as availability, access, mess timings, forecast/AQI calls, guest, safety, insurance, transport, permissions, photo consent and staffing remain pending exactly as surfaced from the Day files.

