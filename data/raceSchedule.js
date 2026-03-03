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
    // ========== 2026 SEASON (all times UTC; PST = UTC−8 for Cali reference) ==========
    // ========== 
    // ========== 
    "1279": { // Australia 03/06-08 | PST: Q open 4:00 PM Mar 7, R close 3:00 PM Mar 8
      race_name: "Australian Grand Prix",
      picks_open: new Date("2026-03-08T00:00:00Z"),
      picks_close: new Date("2026-03-08T23:00:00Z"),
      race_end: new Date("2026-03-09T02:00:00Z"),
    },
    "1280": { // China 03/13-15 Sprint | PST: Q/R 11:00 PM Mar 14, SQ 11:30 PM Mar 13, S 7:00 PM Mar 14
      race_name: "Chinese Grand Prix",
      picks_open: new Date("2026-03-15T07:00:00Z"),
      picks_close: new Date("2026-03-15T07:00:00Z"),
      race_end: new Date("2026-03-15T10:00:00Z"),
      sprint_picks_open: new Date("2026-03-14T07:30:00Z"),
      sprint_picks_closed: new Date("2026-03-15T03:00:00Z"),
      sprint_end: new Date("2026-03-15T05:00:00Z"),
    },
    "1281": { // Japan 03/27-29 | PST: Q open 10:00 PM Mar 28, R close 9:00 PM Mar 28
      race_name: "Japanese Grand Prix",
      picks_open: new Date("2026-03-29T06:00:00Z"),
      picks_close: new Date("2026-03-29T05:00:00Z"),
      race_end: new Date("2026-03-29T08:00:00Z"),
    },
    "1282": { // Bahrain 04/10-12 | PST: Q open 8:00 AM Apr 12, R close 7:00 AM Apr 12
      race_name: "Bahrain Grand Prix",
      picks_open: new Date("2026-04-12T16:00:00Z"),
      picks_close: new Date("2026-04-12T15:00:00Z"),
      race_end: new Date("2026-04-12T18:00:00Z"),
    },
    "1283": { // Saudi Arabia 04/17-19 | PST: Q/R 9:00 AM Apr 19
      race_name: "Saudi Arabian Grand Prix",
      picks_open: new Date("2026-04-19T17:00:00Z"),
      picks_close: new Date("2026-04-19T17:00:00Z"),
      race_end: new Date("2026-04-19T20:00:00Z"),
    },
    "1284": { // Miami 05/01-03 Sprint | PST: Q open 12:00 PM May 2, R close 12:00 PM May 3
      race_name: "Miami Grand Prix",
      picks_open: new Date("2026-05-02T20:00:00Z"),
      picks_close: new Date("2026-05-03T20:00:00Z"),
      race_end: new Date("2026-05-03T23:00:00Z"),
      sprint_picks_open: new Date("2026-05-01T20:30:00Z"),
      sprint_picks_closed: new Date("2026-05-02T16:00:00Z"),
      sprint_end: new Date("2026-05-02T18:00:00Z"),
    },
    "1285": { // Canada 05/22-24 Sprint | PST: Q open 12:00 PM May 23, R close 12:00 PM May 24
      race_name: "Canadian Grand Prix",
      picks_open: new Date("2026-05-23T20:00:00Z"),
      picks_close: new Date("2026-05-24T20:00:00Z"),
      race_end: new Date("2026-05-24T23:00:00Z"),
      sprint_picks_open: new Date("2026-05-22T20:30:00Z"),
      sprint_picks_closed: new Date("2026-05-23T16:00:00Z"),
      sprint_end: new Date("2026-05-23T18:00:00Z"),
    },
    "1286": { // Monaco 06/05-07 | PST: Q open 6:00 AM Jun 6, R close 5:00 AM Jun 7
      race_name: "Monaco Grand Prix",
      picks_open: new Date("2026-06-06T14:00:00Z"),
      picks_close: new Date("2026-06-07T13:00:00Z"),
      race_end: new Date("2026-06-07T16:00:00Z"),
    },
    "1287": { // Spain 06/12-14 | PST: Q open 6:00 AM Jun 13, R close 5:00 AM Jun 14
      race_name: "Spanish Grand Prix",
      picks_open: new Date("2026-06-13T14:00:00Z"),
      picks_close: new Date("2026-06-14T13:00:00Z"),
      race_end: new Date("2026-06-14T16:00:00Z"),
    },
    "1288": { // Austria 06/26-28 | PST: Q open 6:00 AM Jun 27, R close 5:00 AM Jun 28
      race_name: "Austrian Grand Prix",
      picks_open: new Date("2026-06-27T14:00:00Z"),
      picks_close: new Date("2026-06-28T13:00:00Z"),
      race_end: new Date("2026-06-28T16:00:00Z"),
    },
    "1289": { // Great Britain 07/03-05 Sprint | PST: Q open 7:00 AM Jul 4, R close 6:00 AM Jul 5
      race_name: "British Grand Prix",
      picks_open: new Date("2026-07-04T15:00:00Z"),
      picks_close: new Date("2026-07-05T14:00:00Z"),
      race_end: new Date("2026-07-05T17:00:00Z"),
      sprint_picks_open: new Date("2026-07-03T15:30:00Z"),
      sprint_picks_closed: new Date("2026-07-04T11:00:00Z"),
      sprint_end: new Date("2026-07-04T13:00:00Z"),
    },
    "1290": { // Belgium 07/17-19 | PST: Q open 6:00 AM Jul 18, R close 5:00 AM Jul 19
      race_name: "Belgian Grand Prix",
      picks_open: new Date("2026-07-18T14:00:00Z"),
      picks_close: new Date("2026-07-19T13:00:00Z"),
      race_end: new Date("2026-07-19T16:00:00Z"),
    },
    "1291": { // Hungary 07/24-26 | PST: Q open 6:00 AM Jul 25, R close 5:00 AM Jul 26
      race_name: "Hungarian Grand Prix",
      picks_open: new Date("2026-07-25T14:00:00Z"),
      picks_close: new Date("2026-07-26T13:00:00Z"),
      race_end: new Date("2026-07-26T16:00:00Z"),
    },
    "1292": { // Netherlands 08/21-23 Sprint | PST: Q open 6:00 AM Aug 22, R close 5:00 AM Aug 23
      race_name: "Dutch Grand Prix",
      picks_open: new Date("2026-08-22T14:00:00Z"),
      picks_close: new Date("2026-08-23T13:00:00Z"),
      race_end: new Date("2026-08-23T16:00:00Z"),
      sprint_picks_open: new Date("2026-08-21T14:30:00Z"),
      sprint_picks_closed: new Date("2026-08-22T10:00:00Z"),
      sprint_end: new Date("2026-08-22T12:00:00Z"),
    },
    "1293": { // Italy 09/04-06 | PST: Q open 6:00 AM Sep 5, R close 5:00 AM Sep 6
      race_name: "Italian Grand Prix",
      picks_open: new Date("2026-09-05T14:00:00Z"),
      picks_close: new Date("2026-09-06T13:00:00Z"),
      race_end: new Date("2026-09-06T16:00:00Z"),
    },
    "1294": { // Spain (Madrid) 09/11-13 | PST: Q open 6:00 AM Sep 12, R close 5:00 AM Sep 13
      race_name: "Spanish Grand Prix (Madrid)",
      picks_open: new Date("2026-09-12T14:00:00Z"),
      picks_close: new Date("2026-09-13T13:00:00Z"),
      race_end: new Date("2026-09-13T16:00:00Z"),
    },
    "1295": { // Azerbaijan 09/25-27 | PST: Q open 4:00 AM Sep 26, R close 3:00 AM Sep 27
      race_name: "Azerbaijan Grand Prix",
      picks_open: new Date("2026-09-26T12:00:00Z"),
      picks_close: new Date("2026-09-27T11:00:00Z"),
      race_end: new Date("2026-09-27T14:00:00Z"),
    },
    "1296": { // Singapore 10/09-11 Sprint | PST: Q open 5:00 AM Oct 10, R close 4:00 AM Oct 11
      race_name: "Singapore Grand Prix",
      picks_open: new Date("2026-10-10T13:00:00Z"),
      picks_close: new Date("2026-10-11T12:00:00Z"),
      race_end: new Date("2026-10-11T15:00:00Z"),
      sprint_picks_open: new Date("2026-10-09T13:30:00Z"),
      sprint_picks_closed: new Date("2026-10-10T09:00:00Z"),
      sprint_end: new Date("2026-10-10T11:00:00Z"),
    },
    "1297": { // United States 10/23-25 | PST: Q open 12:00 PM Oct 24, R close 11:00 AM Oct 25
      race_name: "United States Grand Prix",
      picks_open: new Date("2026-10-24T20:00:00Z"),
      picks_close: new Date("2026-10-25T19:00:00Z"),
      race_end: new Date("2026-10-25T22:00:00Z"),
    },
    "1298": { // Mexico 10/30-11/01 | PST: Q open 12:00 PM Oct 31, R close 11:00 AM Nov 1
      race_name: "Mexico Grand Prix",
      picks_open: new Date("2026-10-31T20:00:00Z"),
      picks_close: new Date("2026-11-01T19:00:00Z"),
      race_end: new Date("2026-11-01T22:00:00Z"),
    },
    "1299": { // Brazil 11/06-08 | PST: Q open 10:00 AM Nov 7, R close 9:00 AM Nov 8
      race_name: "Brazilian Grand Prix",
      picks_open: new Date("2026-11-07T18:00:00Z"),
      picks_close: new Date("2026-11-08T17:00:00Z"),
      race_end: new Date("2026-11-08T20:00:00Z"),
    },
    "1300": { // Las Vegas 11/19-21 | PST: Q open 8:00 PM Nov 20, R close 7:00 PM Nov 21
      race_name: "Las Vegas Grand Prix",
      picks_open: new Date("2026-11-21T04:00:00Z"),
      picks_close: new Date("2026-11-22T03:00:00Z"),
      race_end: new Date("2026-11-22T06:00:00Z"),
    },
    "1301": { // Qatar 11/27-29 | PST: Q open 9:00 AM Nov 28, R close 8:00 AM Nov 29
      race_name: "Qatar Grand Prix",
      picks_open: new Date("2026-11-28T17:00:00Z"),
      picks_close: new Date("2026-11-29T16:00:00Z"),
      race_end: new Date("2026-11-29T19:00:00Z"),
    },
    "1302": { // Abu Dhabi 12/04-06 | PST: Q open 6:00 AM Dec 5, R close 5:00 AM Dec 6
      race_name: "Abu Dhabi Grand Prix",
      picks_open: new Date("2026-12-05T14:00:00Z"),
      picks_close: new Date("2026-12-06T13:00:00Z"),
      race_end: new Date("2026-12-06T16:00:00Z"),
    },
  };
  
  export default raceSchedule;
