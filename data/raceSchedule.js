const raceSchedule = {
    // ========== 2025 SEASON ==========
    "1254": { // Australia - 03/14, Q: 4:00 PM, R: 1:00 PM
      race_name: "Australian Grand Prix",
      picks_open: new Date("2025-03-14T23:00:00"),
      picks_close: new Date("2025-03-15T21:00:00"),
    },
    "1255": { // China - 03/22, Q: 1:00 AM, R: 12:00 AM (Sprint: SQ 03/22 3:30 PM, S 03/23 11:00 AM)
      race_name: "Chinese Grand Prix",
      picks_open: new Date("2025-03-22T01:00:00"),
      picks_close: new Date("2025-03-23T00:00:00"),
      sprint_picks_open: new Date("2025-03-22T23:30:00"),  // SQ 3:30 PM PST = 11:30 PM UTC
      sprint_picks_closed: new Date("2025-03-23T19:00:00"), // S 11:00 AM PST = 7:00 PM UTC
    },
    "1256": { // Japan - 04/04, Q: 12:00 AM, R: 10:00 PM
      race_name: "Japanese Grand Prix",
      picks_open: new Date("2025-04-04T00:00:00"),
      picks_close: new Date("2025-04-05T22:00:00"),
    },
    "1257": { // Bahrain - 04/12, Q: 10:00 AM, R: 8:00 AM
      race_name: "Bahrain Grand Prix",
      picks_open: new Date("2025-04-12T10:00:00"),
      picks_close: new Date("2025-04-13T08:00:00"),
    },
    "1258": { // Saudi Arabia - 04/19, Q: 11:00 AM, R: 10:00 AM
      race_name: "Saudi Arabian Grand Prix",
      picks_open: new Date("2025-04-19T11:00:00"),
      picks_close: new Date("2025-04-20T10:00:00"),
    },
    "1259": { // Miami - 05/03, Q: 2:00 PM, R: 1:00 PM (Sprint: SQ 05/03 4:30 PM, S 05/04 12:00 PM)
      race_name: "Miami Grand Prix",
      picks_open: new Date("2025-05-03T14:00:00"),
      picks_close: new Date("2025-05-04T13:00:00"),
      sprint_picks_open: new Date("2025-05-03T23:30:00"),  // SQ 4:30 PM PDT = 11:30 PM UTC
      sprint_picks_closed: new Date("2025-05-04T19:00:00"), // S 12:00 PM PDT = 7:00 PM UTC
    },
    "1260": { // Emilia-Romagna - 05/17, Q: 8:00 AM, R: 6:00 AM
      race_name: "Emilia-Romagna Grand Prix",
      picks_open: new Date("2025-05-17T08:00:00"),
      picks_close: new Date("2025-05-18T06:00:00"),
    },
    "1261": { // Monaco - 05/24, Q: 8:00 AM, R: 6:00 AM
      race_name: "Monaco Grand Prix",
      picks_open: new Date("2025-05-24T08:00:00"),
      picks_close: new Date("2025-05-25T06:00:00"),
    },
    "1262": { // Spain - 05/31, Q: 8:00 AM, R: 6:00 AM
      race_name: "Spanish Grand Prix",
      picks_open: new Date("2025-05-31T08:00:00"),
      picks_close: new Date("2025-06-01T06:00:00"),
    },
    "1263": { // Canada - 06/14, Q: 2:00 PM, R: 11:00 AM (Sprint: SQ 06/14 4:30 PM, S 06/15 12:00 PM)
      race_name: "Canadian Grand Prix",
      picks_open: new Date("2025-06-14T14:00:00"),
      picks_close: new Date("2025-06-15T11:00:00"),
      sprint_picks_open: new Date("2025-06-14T23:30:00"),  // SQ 4:30 PM PDT = 11:30 PM UTC
      sprint_picks_closed: new Date("2025-06-15T19:00:00"), // S 12:00 PM PDT = 7:00 PM UTC
    },
    "1264": { // Austria - 06/28, Q: 8:00 AM, R: 6:00 AM
      race_name: "Austrian Grand Prix",
      picks_open: new Date("2025-06-28T08:00:00"),
      picks_close: new Date("2025-06-29T06:00:00"),
    },
    "1277": { // Great Britain - 07/05, Q: 8:00 AM, R: 7:00 AM (Sprint: SQ 07/05 4:30 PM, S 07/06 12:00 PM)
      race_name: "British Grand Prix",
      picks_open: new Date("2025-07-05T08:00:00"),
      picks_close: new Date("2025-07-06T07:00:00"),
      sprint_picks_open: new Date("2025-07-05T23:30:00"),  // SQ 4:30 PM PDT = 11:30 PM UTC
      sprint_picks_closed: new Date("2025-07-06T19:00:00"), // S 12:00 PM PDT = 7:00 PM UTC
    },
    "1265": { // Belgium - 07/26, Q: 8:00 AM, R: 6:00 AM
      race_name: "Belgian Grand Prix",
      picks_open: new Date("2025-07-26T08:00:00"),
      picks_close: new Date("2025-07-27T06:00:00"),
    },
    "1266": { // Hungary - 08/02, Q: 8:00 AM, R: 6:00 AM
      race_name: "Hungarian Grand Prix",
      picks_open: new Date("2025-08-02T08:00:00"),
      picks_close: new Date("2025-08-03T06:00:00"),
    },
    "1267": { // Netherlands - 08/31, Q: 7:00 AM, R: 6:00 AM (Sprint: SQ 08/30 4:30 PM, S 08/31 12:00 PM)
      race_name: "Dutch Grand Prix",
      picks_open: new Date("2025-08-31T07:00:00"),
      picks_close: new Date("2025-08-30T06:00:00"),
      sprint_picks_open: new Date("2025-08-30T23:30:00"),  // SQ 4:30 PM PDT = 11:30 PM UTC
      sprint_picks_closed: new Date("2025-08-31T19:00:00"), // S 12:00 PM PDT = 7:00 PM UTC
    },
    "1268": { // Italy - 09/06, Q: 3:00 PM, R: 1:00 PM
      race_name: "Italian Grand Prix",
      picks_open: new Date("2025-09-06T15:00:00"),
      picks_close: new Date("2025-09-07T13:00:00"),
    },
    "1269": { // Azerbaijan - 09/20, Q: 3:00 PM, R: 12:00 PM
      race_name: "Azerbaijan Grand Prix",
      picks_open: new Date("2025-09-20T15:00:00"),
      picks_close: new Date("2025-09-21T12:00:00"),
    },
    "1270": { // Singapore - 10/04, Q: 7:00 AM, R: 12:00 PM (Sprint: SQ 10/05 9:30 PM, S 10/06 5:00 PM)
      race_name: "Singapore Grand Prix",
      picks_open: new Date("2025-10-04T07:00:00"),
      picks_close: new Date("2025-10-06T12:00:00"),
      sprint_picks_open: new Date("2025-10-06T04:30:00"),  // SQ 9:30 PM PDT = 4:30 AM UTC next day
      sprint_picks_closed: new Date("2025-10-07T00:00:00"), // S 5:00 PM PDT = 12:00 AM UTC next day
    },
    "1271": { // United States - 10/18, Q: 3:00 PM, R: 12:00 PM
      race_name: "United States Grand Prix",
      picks_open: new Date("2025-10-18T15:00:00"),
      picks_close: new Date("2025-10-19T12:00:00"),
    },
    "1272": { // Mexico - 10/25, Q: 3:00 PM, R: 1:00 PM
      race_name: "Mexico Grand Prix",
      picks_open: new Date("2025-10-25T15:00:00"),
      picks_close: new Date("2025-10-26T13:00:00"),
    },
    "1273": { // Brazil - 11/08, Q: 11:00 AM, R: 9:00 AM
      race_name: "Brazilian Grand Prix",
      picks_open: new Date("2025-11-08T11:00:00"),
      picks_close: new Date("2025-11-09T09:00:00"),
    },
    "1274": { // Las Vegas - 11/21, Q: 9:00 PM, R: 8:00 PM
      race_name: "Las Vegas Grand Prix",
      picks_open: new Date("2025-11-21T21:00:00"),
      picks_close: new Date("2025-11-22T20:00:00"),
    },
    "1275": { // Qatar - 11/29, Q: 11:00 AM, R: 8:00 AM
      race_name: "Qatar Grand Prix",
      picks_open: new Date("2025-11-29T11:00:00"),
      picks_close: new Date("2025-11-30T08:00:00"),
    },
    "1276": { // Abu Dhabi - 12/06, Q: 7:00 AM, R: 5:00 AM
      race_name: "Abu Dhabi Grand Prix",
      picks_open: new Date("2025-12-06T07:00:00"),
      picks_close: new Date("2025-12-07T05:00:00"),
    },
    // ========== 
    // ========== 
    // ========== 2026 SEASON (UTC from OpenF1 API; PST = UTC−8 in comments) ==========
    "1279": { // Australia – API Q end 06:00 UTC Mar 7, R start 04:00 UTC Mar 8
      race_name: "Australian Grand Prix",
      picks_open: new Date("2026-03-07T06:00:00Z"),   // PST: 10:00 PM Mar 6
      picks_close: new Date("2026-03-08T04:00:00Z"),  // PST: 8:00 PM Mar 7
      race_end: new Date("2026-03-08T06:00:00Z"),     // PST: 10:00 PM Mar 7
    },
    "1280": { // China Sprint – API Q end 08:00 Mar 14, R start 07:00 Mar 15; SQ end 08:14 Mar 13, S start 03:00 Mar 14
      race_name: "Chinese Grand Prix",
      picks_open: new Date("2026-03-14T08:00:00Z"),   // PST: 12:00 AM Mar 14
      picks_close: new Date("2026-03-15T07:00:00Z"),  // PST: 11:00 PM Mar 14
      race_end: new Date("2026-03-15T09:00:00Z"),     // PST: 1:00 AM Mar 15
      sprint_picks_open: new Date("2026-03-13T08:14:00Z"),   // PST: 12:14 AM Mar 13
      sprint_picks_closed: new Date("2026-03-14T03:00:00Z"), // PST: 7:00 PM Mar 13
      sprint_end: new Date("2026-03-14T04:00:00Z"),   // PST: 8:00 PM Mar 13
    },
    "1281": { // Japan – API Q end 07:00 UTC Mar 28, R start 05:00 UTC Mar 29
      race_name: "Japanese Grand Prix",
      picks_open: new Date("2026-03-28T07:00:00Z"),   // PST: 11:00 PM Mar 27
      picks_close: new Date("2026-03-29T05:00:00Z"),  // PST: 9:00 PM Mar 28
      race_end: new Date("2026-03-29T07:00:00Z"),     // PST: 11:00 PM Mar 28
    },
    "1282": { // Bahrain – API Q end 17:00 Apr 11, R start 15:00 Apr 12
      race_name: "Bahrain Grand Prix",
      picks_open: new Date("2026-04-11T17:00:00Z"),   // PST: 10:00 AM Apr 11
      picks_close: new Date("2026-04-12T15:00:00Z"),  // PST: 8:00 AM Apr 12
      race_end: new Date("2026-04-12T17:00:00Z"),     // PST: 10:00 AM Apr 12
    },
    "1283": { // Saudi – API Q end 18:00 Apr 18, R start 17:00 Apr 19
      race_name: "Saudi Arabian Grand Prix",
      picks_open: new Date("2026-04-18T18:00:00Z"),   // PST: 11:00 AM Apr 18
      picks_close: new Date("2026-04-19T17:00:00Z"),  // PST: 10:00 AM Apr 19
      race_end: new Date("2026-04-19T19:00:00Z"),     // PST: 12:00 PM Apr 19
    },
    "1284": { // Miami Sprint – API Q end 21:00 May 2, R start 20:00 May 3; SQ end 21:14 May 1, S start 16:00 May 2
      race_name: "Miami Grand Prix",
      picks_open: new Date("2026-05-02T21:00:00Z"),   // PST: 2:00 PM May 2
      picks_close: new Date("2026-05-03T18:00:00Z"),  // PST: 10:00 AM May 3
      race_end: new Date("2026-05-03T22:00:00Z"),     // PST: 2:00 PM May 3
      sprint_picks_open: new Date("2026-05-01T21:14:00Z"),   // PST: 2:14 PM May 1
      sprint_picks_closed: new Date("2026-05-02T16:00:00Z"), // PST: 9:00 AM May 2
      sprint_end: new Date("2026-05-02T17:00:00Z"),   // PST: 10:00 AM May 2
    },
    "1285": { // Canada Sprint – API Q end 21:00 May 23, R start 20:00 May 24; SQ end 21:14 May 22, S start 16:00 May 23
      race_name: "Canadian Grand Prix",
      picks_open: new Date("2026-05-23T21:00:00Z"),   // PST: 2:00 PM May 23
      picks_close: new Date("2026-05-24T20:00:00Z"),  // PST: 12:00 PM May 24
      race_end: new Date("2026-05-24T22:00:00Z"),     // PST: 2:00 PM May 24
      sprint_picks_open: new Date("2026-05-22T21:14:00Z"),   // PST: 2:14 PM May 22
      sprint_picks_closed: new Date("2026-05-23T16:00:00Z"), // PST: 9:00 AM May 23
      sprint_end: new Date("2026-05-23T17:00:00Z"),   // PST: 10:00 AM May 23
    },
    "1286": { // Monaco – API Q end 15:00 Jun 6, R start 13:00 Jun 7
      race_name: "Monaco Grand Prix",
      picks_open: new Date("2026-06-06T15:00:00Z"),   // PST: 8:00 AM Jun 6
      picks_close: new Date("2026-06-07T13:00:00Z"),  // PST: 6:00 AM Jun 7
      race_end: new Date("2026-06-07T15:00:00Z"),     // PST: 8:00 AM Jun 7
    },
    "1287": { // Spain – API Q end 15:00 Jun 13, R start 13:00 Jun 14
      race_name: "Spanish Grand Prix",
      picks_open: new Date("2026-06-13T15:00:00Z"),   // PST: 8:00 AM Jun 13
      picks_close: new Date("2026-06-14T13:00:00Z"),  // PST: 6:00 AM Jun 14
      race_end: new Date("2026-06-14T15:00:00Z"),     // PST: 8:00 AM Jun 14
    },
    "1288": { // Austria – API Q end 15:00 Jun 27, R start 13:00 Jun 28
      race_name: "Austrian Grand Prix",
      picks_open: new Date("2026-06-27T15:00:00Z"),   // PST: 8:00 AM Jun 27
      picks_close: new Date("2026-06-28T13:00:00Z"),  // PST: 6:00 AM Jun 28
      race_end: new Date("2026-06-28T15:00:00Z"),     // PST: 8:00 AM Jun 28
    },
    "1289": { // Britain Sprint – API Q end 16:00 Jul 4, R start 14:00 Jul 5; SQ end 16:14 Jul 3, S start 11:00 Jul 4
      race_name: "British Grand Prix",
      picks_open: new Date("2026-07-04T16:00:00Z"),   // PST: 9:00 AM Jul 4
      picks_close: new Date("2026-07-05T14:00:00Z"),  // PST: 7:00 AM Jul 5
      race_end: new Date("2026-07-05T16:00:00Z"),     // PST: 9:00 AM Jul 5
      sprint_picks_open: new Date("2026-07-03T16:14:00Z"),   // PST: 9:14 AM Jul 3
      sprint_picks_closed: new Date("2026-07-04T11:00:00Z"), // PST: 4:00 AM Jul 4
      sprint_end: new Date("2026-07-04T12:00:00Z"),   // PST: 5:00 AM Jul 4
    },
    "1290": { // Belgium – API Q end 15:00 Jul 18, R start 13:00 Jul 19
      race_name: "Belgian Grand Prix",
      picks_open: new Date("2026-07-18T15:00:00Z"),   // PST: 8:00 AM Jul 18
      picks_close: new Date("2026-07-19T13:00:00Z"),  // PST: 6:00 AM Jul 19
      race_end: new Date("2026-07-19T15:00:00Z"),     // PST: 8:00 AM Jul 19
    },
    "1291": { // Hungary – API Q end 15:00 Jul 25, R start 13:00 Jul 26
      race_name: "Hungarian Grand Prix",
      picks_open: new Date("2026-07-25T15:00:00Z"),   // PST: 8:00 AM Jul 25
      picks_close: new Date("2026-07-26T13:00:00Z"),  // PST: 6:00 AM Jul 26
      race_end: new Date("2026-07-26T15:00:00Z"),     // PST: 8:00 AM Jul 26
    },
    "1292": { // Netherlands Sprint – API Q end 15:00 Aug 22, R start 13:00 Aug 23; SQ end 15:14 Aug 21, S start 10:00 Aug 22
      race_name: "Dutch Grand Prix",
      picks_open: new Date("2026-08-22T15:00:00Z"),   // PST: 8:00 AM Aug 22
      picks_close: new Date("2026-08-23T13:00:00Z"),  // PST: 6:00 AM Aug 23
      race_end: new Date("2026-08-23T15:00:00Z"),     // PST: 8:00 AM Aug 23
      sprint_picks_open: new Date("2026-08-21T15:14:00Z"),   // PST: 8:14 AM Aug 21
      sprint_picks_closed: new Date("2026-08-22T10:00:00Z"), // PST: 3:00 AM Aug 22
      sprint_end: new Date("2026-08-22T11:00:00Z"),   // PST: 4:00 AM Aug 22
    },
    "1293": { // Italy – API Q end 15:00 Sep 5, R start 13:00 Sep 6
      race_name: "Italian Grand Prix",
      picks_open: new Date("2026-09-05T15:00:00Z"),   // PST: 8:00 AM Sep 5
      picks_close: new Date("2026-09-06T13:00:00Z"),  // PST: 6:00 AM Sep 6
      race_end: new Date("2026-09-06T15:00:00Z"),     // PST: 8:00 AM Sep 6
    },
    "1294": { // Spain Madrid – API Q end 15:00 Sep 12, R start 13:00 Sep 13
      race_name: "Spanish Grand Prix (Madrid)",
      picks_open: new Date("2026-09-12T15:00:00Z"),   // PST: 8:00 AM Sep 12
      picks_close: new Date("2026-09-13T13:00:00Z"),  // PST: 6:00 AM Sep 13
      race_end: new Date("2026-09-13T15:00:00Z"),     // PST: 8:00 AM Sep 13
    },
    "1295": { // Azerbaijan – API Q end 13:00 Sep 25, R start 11:00 Sep 26
      race_name: "Azerbaijan Grand Prix",
      picks_open: new Date("2026-09-25T13:00:00Z"),   // PST: 6:00 AM Sep 25
      picks_close: new Date("2026-09-26T11:00:00Z"),  // PST: 4:00 AM Sep 26
      race_end: new Date("2026-09-26T13:00:00Z"),     // PST: 6:00 AM Sep 26
    },
    "1296": { // Singapore Sprint – API Q end 14:00 Oct 10, R start 12:00 Oct 11; SQ end 13:14 Oct 9, S start 09:00 Oct 10
      race_name: "Singapore Grand Prix",
      picks_open: new Date("2026-10-10T14:00:00Z"),   // PST: 7:00 AM Oct 10
      picks_close: new Date("2026-10-11T12:00:00Z"),  // PST: 5:00 AM Oct 11
      race_end: new Date("2026-10-11T14:00:00Z"),     // PST: 7:00 AM Oct 11
      sprint_picks_open: new Date("2026-10-09T13:14:00Z"),   // PST: 6:14 AM Oct 9
      sprint_picks_closed: new Date("2026-10-10T09:00:00Z"), // PST: 2:00 AM Oct 10
      sprint_end: new Date("2026-10-10T10:00:00Z"),   // PST: 3:00 AM Oct 10
    },
    "1297": { // USA Austin – API Q end 22:00 Oct 24, R start 20:00 Oct 25
      race_name: "United States Grand Prix",
      picks_open: new Date("2026-10-24T22:00:00Z"),   // PST: 3:00 PM Oct 24
      picks_close: new Date("2026-10-25T20:00:00Z"),  // PST: 1:00 PM Oct 25
      race_end: new Date("2026-10-25T22:00:00Z"),     // PST: 3:00 PM Oct 25
    },
    "1298": { // Mexico – API Q end 22:00 Oct 31, R start 20:00 Nov 1
      race_name: "Mexico Grand Prix",
      picks_open: new Date("2026-10-31T22:00:00Z"),   // PST: 3:00 PM Oct 31
      picks_close: new Date("2026-11-01T20:00:00Z"),  // PST: 1:00 PM Nov 1
      race_end: new Date("2026-11-01T22:00:00Z"),     // PST: 3:00 PM Nov 1
    },
    "1299": { // Brazil – API Q end 19:00 Nov 7, R start 17:00 Nov 8
      race_name: "Brazilian Grand Prix",
      picks_open: new Date("2026-11-07T19:00:00Z"),   // PST: 11:00 AM Nov 7
      picks_close: new Date("2026-11-08T17:00:00Z"),  // PST: 9:00 AM Nov 8
      race_end: new Date("2026-11-08T19:00:00Z"),     // PST: 11:00 AM Nov 8
    },
    "1300": { // Las Vegas – API Q end 05:00 Nov 21, R start 04:00 Nov 22
      race_name: "Las Vegas Grand Prix",
      picks_open: new Date("2026-11-21T05:00:00Z"),   // PST: 9:00 PM Nov 20
      picks_close: new Date("2026-11-22T04:00:00Z"),  // PST: 8:00 PM Nov 21
      race_end: new Date("2026-11-22T06:00:00Z"),     // PST: 10:00 PM Nov 21
    },
    "1301": { // Qatar – API Q end 19:00 Nov 28, R start 16:00 Nov 29
      race_name: "Qatar Grand Prix",
      picks_open: new Date("2026-11-28T19:00:00Z"),   // PST: 11:00 AM Nov 28
      picks_close: new Date("2026-11-29T16:00:00Z"),  // PST: 8:00 AM Nov 29
      race_end: new Date("2026-11-29T18:00:00Z"),     // PST: 10:00 AM Nov 29
    },
    "1302": { // Abu Dhabi – API Q end 15:00 Dec 5, R start 13:00 Dec 6
      race_name: "Abu Dhabi Grand Prix",
      picks_open: new Date("2026-12-05T15:00:00Z"),   // PST: 7:00 AM Dec 5
      picks_close: new Date("2026-12-06T13:00:00Z"),  // PST: 5:00 AM Dec 6
      race_end: new Date("2026-12-06T15:00:00Z"),     // PST: 7:00 AM Dec 6
    },
  };
  
  export default raceSchedule;
