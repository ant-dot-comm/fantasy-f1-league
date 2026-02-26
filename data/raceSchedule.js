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
    // ========== 2026 SEASON ==========
    "1300": { // Australia - 03/06-08, Q: 4:00 PM, R: 3:00 PM
      race_name: "Australian Grand Prix",
      picks_open: new Date("2026-03-08T00:00:00"),  // Q 4:00 PM AEDT = 12:00 AM UTC next day (Mar 8)
      picks_close: new Date("2026-03-08T23:00:00"), // R 3:00 PM AEDT = 11:00 PM UTC (Mar 8)
      race_end: new Date("2026-03-09T02:00:00"),   // R + 3h
    },
    "1301": { // China - 03/13-15, Sprint weekend, SQ: 3:30 PM, S: 11:00 AM, Q: 3:00 PM, R: 3:00 PM
      race_name: "Chinese Grand Prix",
      picks_open: new Date("2026-03-15T07:00:00"),  // Q 3:00 PM CST = 7:00 AM UTC (Mar 15)
      picks_close: new Date("2026-03-15T07:00:00"), // R 3:00 PM CST = 7:00 AM UTC (Mar 15)
      race_end: new Date("2026-03-15T10:00:00"),   // R + 3h
      sprint_picks_open: new Date("2026-03-14T07:30:00"),  // SQ 3:30 PM CST = 7:30 AM UTC (Mar 14)
      sprint_picks_closed: new Date("2026-03-15T03:00:00"), // S 11:00 AM CST = 3:00 AM UTC (Mar 15)
      sprint_end: new Date("2026-03-15T05:00:00"),  // S + 2h
    },
    "1302": { // Japan - 03/27-29, Q: 3:00 PM, R: 2:00 PM
      race_name: "Japanese Grand Prix",
      picks_open: new Date("2026-03-29T06:00:00"),  // Q 3:00 PM JST = 6:00 AM UTC (Mar 29)
      picks_close: new Date("2026-03-29T05:00:00"), // R 2:00 PM JST = 5:00 AM UTC (Mar 29)
      race_end: new Date("2026-03-29T08:00:00"),   // R + 3h
    },
    "1303": { // Bahrain - 04/10-12, Q: 7:00 PM, R: 6:00 PM
      race_name: "Bahrain Grand Prix",
      picks_open: new Date("2026-04-12T16:00:00"),  // Q 7:00 PM AST = 4:00 PM UTC (Apr 12)
      picks_close: new Date("2026-04-12T15:00:00"), // R 6:00 PM AST = 3:00 PM UTC (Apr 12)
      race_end: new Date("2026-04-12T18:00:00"),   // R + 3h
    },
    "1304": { // Saudi Arabia - 04/17-19, Q: 8:00 PM, R: 8:00 PM
      race_name: "Saudi Arabian Grand Prix",
      picks_open: new Date("2026-04-19T17:00:00"),  // Q 8:00 PM AST = 5:00 PM UTC (Apr 19)
      picks_close: new Date("2026-04-19T17:00:00"), // R 8:00 PM AST = 5:00 PM UTC (Apr 19)
      race_end: new Date("2026-04-19T20:00:00"),   // R + 3h
    },
    "1305": { // Miami - 05/01-03, Sprint weekend, SQ: 4:30 PM, S: 12:00 PM, Q: 4:00 PM, R: 4:00 PM
      race_name: "Miami Grand Prix",
      picks_open: new Date("2026-05-02T20:00:00"),  // Q 4:00 PM EDT = 8:00 PM UTC (May 2)
      picks_close: new Date("2026-05-03T20:00:00"), // R 4:00 PM EDT = 8:00 PM UTC (May 3)
      race_end: new Date("2026-05-03T23:00:00"),   // R + 3h
      sprint_picks_open: new Date("2026-05-01T20:30:00"),  // SQ 4:30 PM EDT = 8:30 PM UTC (May 1)
      sprint_picks_closed: new Date("2026-05-02T16:00:00"), // S 12:00 PM EDT = 4:00 PM UTC (May 2)
      sprint_end: new Date("2026-05-02T18:00:00"),  // S + 2h
    },
    "1306": { // Canada - 05/22-24, Sprint weekend, SQ: 4:30 PM, S: 12:00 PM, Q: 4:00 PM, R: 4:00 PM
      race_name: "Canadian Grand Prix",
      picks_open: new Date("2026-05-23T20:00:00"),  // Q 4:00 PM EDT = 8:00 PM UTC (May 23)
      picks_close: new Date("2026-05-24T20:00:00"), // R 4:00 PM EDT = 8:00 PM UTC (May 24)
      race_end: new Date("2026-05-24T23:00:00"),   // R + 3h
      sprint_picks_open: new Date("2026-05-22T20:30:00"),  // SQ 4:30 PM EDT = 8:30 PM UTC (May 22)
      sprint_picks_closed: new Date("2026-05-23T16:00:00"), // S 12:00 PM EDT = 4:00 PM UTC (May 23)
      sprint_end: new Date("2026-05-23T18:00:00"),  // S + 2h
    },
    "1307": { // Monaco - 06/05-07, Q: 4:00 PM, R: 3:00 PM
      race_name: "Monaco Grand Prix",
      picks_open: new Date("2026-06-06T14:00:00"),  // Q 4:00 PM CEST = 2:00 PM UTC (Jun 6)
      picks_close: new Date("2026-06-07T13:00:00"), // R 3:00 PM CEST = 1:00 PM UTC (Jun 7)
      race_end: new Date("2026-06-07T16:00:00"),   // R + 3h
    },
    "1308": { // Spain - 06/12-14, Q: 4:00 PM, R: 3:00 PM
      race_name: "Spanish Grand Prix",
      picks_open: new Date("2026-06-13T14:00:00"),  // Q 4:00 PM CEST = 2:00 PM UTC (Jun 13)
      picks_close: new Date("2026-06-14T13:00:00"), // R 3:00 PM CEST = 1:00 PM UTC (Jun 14)
      race_end: new Date("2026-06-14T16:00:00"),   // R + 3h
    },
    "1309": { // Austria - 06/26-28, Q: 4:00 PM, R: 3:00 PM
      race_name: "Austrian Grand Prix",
      picks_open: new Date("2026-06-27T14:00:00"),  // Q 4:00 PM CEST = 2:00 PM UTC (Jun 27)
      picks_close: new Date("2026-06-28T13:00:00"), // R 3:00 PM CEST = 1:00 PM UTC (Jun 28)
      race_end: new Date("2026-06-28T16:00:00"),   // R + 3h
    },
    "1310": { // Great Britain - 07/03-05, Sprint weekend, SQ: 4:30 PM, S: 12:00 PM, Q: 4:00 PM, R: 3:00 PM
      race_name: "British Grand Prix",
      picks_open: new Date("2026-07-04T15:00:00"),  // Q 4:00 PM BST = 3:00 PM UTC (Jul 4)
      picks_close: new Date("2026-07-05T14:00:00"), // R 3:00 PM BST = 2:00 PM UTC (Jul 5)
      race_end: new Date("2026-07-05T17:00:00"),   // R + 3h
      sprint_picks_open: new Date("2026-07-03T15:30:00"),  // SQ 4:30 PM BST = 3:30 PM UTC (Jul 3)
      sprint_picks_closed: new Date("2026-07-04T11:00:00"), // S 12:00 PM BST = 11:00 AM UTC (Jul 4)
      sprint_end: new Date("2026-07-04T13:00:00"),  // S + 2h
    },
    "1311": { // Belgium - 07/17-19, Q: 4:00 PM, R: 3:00 PM
      race_name: "Belgian Grand Prix",
      picks_open: new Date("2026-07-18T14:00:00"),  // Q 4:00 PM CEST = 2:00 PM UTC (Jul 18)
      picks_close: new Date("2026-07-19T13:00:00"), // R 3:00 PM CEST = 1:00 PM UTC (Jul 19)
      race_end: new Date("2026-07-19T16:00:00"),   // R + 3h
    },
    "1312": { // Hungary - 07/24-26, Q: 4:00 PM, R: 3:00 PM
      race_name: "Hungarian Grand Prix",
      picks_open: new Date("2026-07-25T14:00:00"),  // Q 4:00 PM CEST = 2:00 PM UTC (Jul 25)
      picks_close: new Date("2026-07-26T13:00:00"), // R 3:00 PM CEST = 1:00 PM UTC (Jul 26)
      race_end: new Date("2026-07-26T16:00:00"),   // R + 3h
    },
    "1313": { // Netherlands - 08/21-23, Sprint weekend, SQ: 4:30 PM, S: 12:00 PM, Q: 4:00 PM, R: 3:00 PM
      race_name: "Dutch Grand Prix",
      picks_open: new Date("2026-08-22T14:00:00"),  // Q 4:00 PM CEST = 2:00 PM UTC (Aug 22)
      picks_close: new Date("2026-08-23T13:00:00"), // R 3:00 PM CEST = 1:00 PM UTC (Aug 23)
      race_end: new Date("2026-08-23T16:00:00"),   // R + 3h
      sprint_picks_open: new Date("2026-08-21T14:30:00"),  // SQ 4:30 PM CEST = 2:30 PM UTC (Aug 21)
      sprint_picks_closed: new Date("2026-08-22T10:00:00"), // S 12:00 PM CEST = 10:00 AM UTC (Aug 22)
      sprint_end: new Date("2026-08-22T12:00:00"),  // S + 2h
    },
    "1314": { // Italy - 09/04-06, Q: 4:00 PM, R: 3:00 PM
      race_name: "Italian Grand Prix",
      picks_open: new Date("2026-09-05T14:00:00"),  // Q 4:00 PM CEST = 2:00 PM UTC (Sep 5)
      picks_close: new Date("2026-09-06T13:00:00"), // R 3:00 PM CEST = 1:00 PM UTC (Sep 6)
      race_end: new Date("2026-09-06T16:00:00"),   // R + 3h
    },
    "1315": { // Spain (Madrid) - 09/11-13, Q: 4:00 PM, R: 3:00 PM
      race_name: "Spanish Grand Prix (Madrid)",
      picks_open: new Date("2026-09-12T14:00:00"),  // Q 4:00 PM CEST = 2:00 PM UTC (Sep 12)
      picks_close: new Date("2026-09-13T13:00:00"), // R 3:00 PM CEST = 1:00 PM UTC (Sep 13)
      race_end: new Date("2026-09-13T16:00:00"),   // R + 3h
    },
    "1316": { // Azerbaijan - 09/25-27, Q: 4:00 PM, R: 3:00 PM
      race_name: "Azerbaijan Grand Prix",
      picks_open: new Date("2026-09-26T12:00:00"),  // Q 4:00 PM AZT = 12:00 PM UTC (Sep 26)
      picks_close: new Date("2026-09-27T11:00:00"), // R 3:00 PM AZT = 11:00 AM UTC (Sep 27)
      race_end: new Date("2026-09-27T14:00:00"),   // R + 3h
    },
    "1317": { // Singapore - 10/09-11, Sprint weekend, SQ: 9:30 PM, S: 5:00 PM, Q: 9:00 PM, R: 8:00 PM
      race_name: "Singapore Grand Prix",
      picks_open: new Date("2026-10-10T13:00:00"),  // Q 9:00 PM SGT = 1:00 PM UTC (Oct 10)
      picks_close: new Date("2026-10-11T12:00:00"), // R 8:00 PM SGT = 12:00 PM UTC (Oct 11)
      race_end: new Date("2026-10-11T15:00:00"),   // R + 3h
      sprint_picks_open: new Date("2026-10-09T13:30:00"),  // SQ 9:30 PM SGT = 1:30 PM UTC (Oct 9)
      sprint_picks_closed: new Date("2026-10-10T09:00:00"), // S 5:00 PM SGT = 9:00 AM UTC (Oct 10)
      sprint_end: new Date("2026-10-10T11:00:00"),  // S + 2h
    },
    "1318": { // United States - 10/23-25, Q: 4:00 PM, R: 3:00 PM
      race_name: "United States Grand Prix",
      picks_open: new Date("2026-10-24T20:00:00"),  // Q 4:00 PM CDT = 9:00 PM UTC (Oct 24)
      picks_close: new Date("2026-10-25T19:00:00"), // R 3:00 PM CDT = 8:00 PM UTC (Oct 25)
      race_end: new Date("2026-10-25T22:00:00"),   // R + 3h
    },
    "1319": { // Mexico - 10/30-11/01, Q: 3:00 PM, R: 2:00 PM
      race_name: "Mexico Grand Prix",
      picks_open: new Date("2026-10-31T20:00:00"),  // Q 3:00 PM CDT = 8:00 PM UTC (Oct 31)
      picks_close: new Date("2026-11-01T19:00:00"), // R 2:00 PM CDT = 7:00 PM UTC (Nov 1)
      race_end: new Date("2026-11-01T22:00:00"),   // R + 3h
    },
    "1320": { // Brazil - 11/06-08, Q: 3:00 PM, R: 2:00 PM
      race_name: "Brazilian Grand Prix",
      picks_open: new Date("2026-11-07T18:00:00"),  // Q 3:00 PM BRT = 6:00 PM UTC (Nov 7)
      picks_close: new Date("2026-11-08T17:00:00"), // R 2:00 PM BRT = 5:00 PM UTC (Nov 8)
      race_end: new Date("2026-11-08T20:00:00"),   // R + 3h
    },
    "1321": { // Las Vegas - 11/19-21, Q: 8:00 PM, R: 7:00 PM
      race_name: "Las Vegas Grand Prix",
      picks_open: new Date("2026-11-21T04:00:00"),  // Q 8:00 PM PST = 4:00 AM UTC next day (Nov 21)
      picks_close: new Date("2026-11-22T03:00:00"), // R 7:00 PM PST = 3:00 AM UTC next day (Nov 22)
      race_end: new Date("2026-11-22T06:00:00"),   // R + 3h
    },
    "1322": { // Qatar - 11/27-29, Q: 9:00 PM, R: 8:00 PM
      race_name: "Qatar Grand Prix",
      picks_open: new Date("2026-11-28T17:00:00"),  // Q 9:00 PM AST = 5:00 PM UTC (Nov 28)
      picks_close: new Date("2026-11-29T16:00:00"), // R 8:00 PM AST = 4:00 PM UTC (Nov 29)
      race_end: new Date("2026-11-29T19:00:00"),   // R + 3h
    },
    "1323": { // Abu Dhabi - 12/04-06, Q: 6:00 PM, R: 5:00 PM
      race_name: "Abu Dhabi Grand Prix",
      picks_open: new Date("2026-12-05T14:00:00"),  // Q 6:00 PM GST = 2:00 PM UTC (Dec 5)
      picks_close: new Date("2026-12-06T13:00:00"), // R 5:00 PM GST = 1:00 PM UTC (Dec 6)
      race_end: new Date("2026-12-06T16:00:00"),   // R + 3h
    },
  };
  
  export default raceSchedule;
