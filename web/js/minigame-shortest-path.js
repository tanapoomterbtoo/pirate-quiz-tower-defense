/**
 * Mini-game: หาเส้นทางสั้นสุด บ้าน → โรงเรียน (สถานการณ์ shortest-path)
 * Layout: แผนที่ซ้าย · ปุ่มทิศทางขวา · เปิดอัตโนมัติเมื่อเข้าสถานการณ์
 */
(function (global) {
    "use strict";

    const MAP_SRC = "../assets/images/questions/math/image14.png";
    const MAP_W = 1167;
    const MAP_H = 825;
    const TARGET_SHORTEST_KM = 10;

    const NODES = {
        home: { x: 328, y: 750, label: "บ้าน", kind: "home" },
        botL: { x: 483, y: 750, label: "แยกถนนล่าง" },
        midL: { x: 483, y: 556, label: "แยกกลาง-ซ้าย" },
        midR: { x: 809, y: 556, label: "แยกกลาง-ขวา" },
        spur: { x: 260, y: 556, label: "ทางตัน" },
        upL: { x: 483, y: 367, label: "แยกบน-ซ้าย" },
        upR: { x: 809, y: 367, label: "แยกบน-ขวา" },
        topL: { x: 300, y: 175, label: "วงรีซ้าย" },
        school: { x: 620, y: 175, label: "โรงเรียน", kind: "school" },
        topR: { x: 809, y: 175, label: "แยกใกล้โรงเรียน" },
        rTop: { x: 960, y: 200, label: "วงขวา-บน" },
        rOut: { x: 985, y: 360, label: "วงขวา-กลาง" },
        rBot: { x: 920, y: 556, label: "วงขวา-ล่าง" },
    };

    const EDGE_DEFS = [
        { a: "home", b: "botL", px: 155.0, mids: [[335,750],[342,750],[349,750],[356,750],[363,750],[370,750],[377,750],[384,750],[391,750],[398,750],[405,750],[412,750],[419,750],[426,750],[433,750],[440,750],[447,750],[454,750],[461,750],[468,750],[475,750]] },
        { a: "botL", b: "midL", px: 194.0, mids: [[483,743],[483,736],[483,729],[483,722],[483,715],[483,708],[483,701],[483,694],[483,687],[483,680],[483,673],[483,666],[483,659],[483,652],[483,645],[483,638],[483,631],[483,624],[483,617],[483,610],[483,603],[483,596],[483,589],[483,582],[483,575],[483,568],[483,561]] },
        { a: "botL", b: "midR", px: 476.4, mids: [[489,750],[495,750],[501,750],[507,750],[513,750],[519,750],[525,750],[531,750],[537,750],[543,750],[549,750],[555,750],[561,750],[566,750],[572,750],[578,750],[584,750],[590,750],[596,750],[602,750],[608,750],[614,750],[620,750],[626,750],[632,750],[638,750],[644,750],[650,750],[656,750],[662,750],[668,750],[674,750],[680,750],[686,750],[692,750],[698,750],[704,750],[710,750],[715,750],[721,749],[727,747],[733,747],[738,745],[744,743],[749,741],[755,738],[760,735],[765,732],[770,728],[774,725],[779,720],[783,716],[786,712],[790,707],[793,702],[797,697],[799,692],[801,686],[803,680],[805,675],[806,669],[807,663],[808,657],[808,651],[808,645],[808,639],[808,633],[808,627],[808,621],[808,615],[808,609],[808,603],[808,597],[808,591],[808,585],[808,580],[808,574],[808,568],[808,562]] },
        { a: "midL", b: "spur", px: 223.0, mids: [[476,556],[469,556],[462,556],[455,556],[448,556],[441,556],[434,556],[427,556],[420,556],[413,556],[406,556],[399,556],[392,556],[385,556],[378,556],[371,556],[364,556],[357,556],[350,556],[343,556],[336,556],[329,556],[322,556],[315,556],[308,556],[301,556],[294,556],[287,556],[280,556],[273,556],[266,556]] },
        { a: "midL", b: "midR", px: 326.0, mids: [[490,556],[497,556],[504,556],[511,556],[518,556],[525,556],[532,556],[539,556],[546,556],[553,556],[560,556],[567,556],[574,556],[581,556],[588,556],[595,556],[602,556],[609,556],[616,556],[623,556],[630,556],[637,556],[644,556],[651,556],[658,556],[665,556],[672,556],[679,556],[686,556],[693,556],[700,556],[707,556],[714,556],[721,556],[728,556],[735,556],[742,556],[749,556],[756,556],[763,556],[770,556],[777,556],[784,556],[791,556],[798,556],[805,556]] },
        { a: "midL", b: "upL", px: 189.0, mids: [[483,549],[483,542],[483,535],[483,528],[483,521],[483,514],[483,507],[483,500],[483,493],[483,486],[483,479],[483,472],[483,465],[483,458],[483,451],[483,444],[483,437],[483,430],[483,423],[483,416],[483,409],[483,402],[483,395],[483,388],[483,381],[483,374]] },
        { a: "midR", b: "upR", px: 189.0, mids: [[809,549],[809,542],[809,535],[809,528],[809,521],[809,514],[809,507],[809,500],[809,493],[809,486],[809,479],[809,472],[809,465],[809,458],[809,451],[809,444],[809,437],[809,430],[809,423],[809,416],[809,409],[809,402],[809,395],[809,388],[809,381],[809,374]] },
        { a: "upL", b: "upR", px: 326.0, mids: [[490,367],[497,367],[504,367],[511,367],[518,367],[525,367],[532,367],[539,367],[546,367],[553,367],[560,367],[567,367],[574,367],[581,367],[588,367],[595,367],[602,367],[609,367],[616,367],[623,367],[630,367],[637,367],[644,367],[651,367],[658,367],[665,367],[672,367],[679,367],[686,367],[693,367],[700,367],[707,367],[714,367],[721,367],[728,367],[735,367],[742,367],[749,367],[756,367],[763,367],[770,367],[777,367],[784,367],[791,367],[798,367],[805,367]] },
        { a: "upL", b: "topL", px: 425.6, mids: [[478,367],[473,367],[468,367],[463,367],[458,367],[453,367],[448,367],[443,367],[438,367],[433,367],[428,367],[423,367],[418,367],[413,367],[408,367],[403,367],[398,367],[393,367],[388,367],[383,367],[378,367],[373,367],[368,367],[363,367],[358,367],[353,367],[348,367],[343,367],[338,367],[333,367],[328,367],[323,366],[318,366],[313,365],[309,363],[304,362],[299,360],[295,358],[290,355],[286,352],[282,350],[278,347],[275,343],[271,339],[268,336],[265,332],[262,328],[258,324],[255,320],[253,316],[250,312],[248,307],[245,303],[243,298],[241,294],[240,289],[238,284],[237,279],[236,275],[235,270],[235,265],[235,260],[235,255],[235,250],[236,245],[237,240],[238,235],[239,230],[241,225],[243,221],[245,216],[248,212],[251,208],[254,204],[257,201],[261,197],[265,194],[269,191],[273,189],[278,186],[282,184],[287,182],[291,179],[296,177]] },
        { a: "topL", b: "school", px: 320.0, mids: [[307,175],[314,175],[321,175],[328,175],[335,175],[342,175],[349,175],[356,175],[363,175],[370,175],[377,175],[384,175],[391,175],[398,175],[405,175],[412,175],[419,175],[426,175],[433,175],[440,175],[447,175],[454,175],[461,175],[468,175],[475,175],[482,175],[489,175],[496,175],[503,175],[510,175],[517,175],[524,175],[531,175],[538,175],[545,175],[552,175],[559,175],[566,175],[573,175],[580,175],[587,175],[594,175],[601,175],[608,175],[615,175]] },
        { a: "school", b: "topR", px: 189.0, mids: [[627,175],[634,175],[641,175],[648,175],[655,175],[662,175],[669,175],[676,175],[683,175],[690,175],[697,175],[704,175],[711,175],[718,175],[725,175],[732,175],[739,175],[746,175],[753,175],[760,175],[767,175],[774,175],[781,175],[788,175],[795,175],[802,175]] },
        { a: "topR", b: "upR", px: 192.0, mids: [[809,182],[809,189],[809,196],[809,203],[809,210],[809,217],[809,224],[809,231],[809,238],[809,245],[809,252],[809,259],[809,266],[809,273],[809,280],[809,287],[809,294],[809,301],[809,308],[809,315],[809,322],[809,329],[809,336],[809,343],[809,350],[809,357],[809,364]] },
        { a: "topR", b: "rTop", px: 157.8, mids: [[814,175],[819,175],[824,175],[829,175],[834,175],[839,175],[844,175],[848,175],[853,175],[858,175],[863,175],[868,175],[873,175],[878,175],[883,175],[888,175],[893,175],[898,175],[903,175],[908,176],[912,176],[917,177],[922,178],[927,179],[932,181],[936,183],[940,185],[945,188],[949,191],[952,194],[956,197]] },
        { a: "rTop", b: "rOut", px: 168.6, mids: [[962,204],[964,209],[967,213],[970,217],[973,221],[975,225],[978,230],[980,234],[982,239],[984,243],[986,248],[987,252],[988,257],[989,262],[990,267],[991,272],[992,277],[993,282],[993,287],[993,292],[993,297],[993,301],[993,306],[992,311],[992,316],[991,321],[990,326],[989,331],[987,336],[986,340],[985,345],[985,350],[985,355]] },
        { a: "rOut", b: "rBot", px: 232.2, mids: [[986,365],[988,370],[989,375],[990,380],[991,385],[992,389],[992,394],[993,399],[993,405],[993,410],[993,415],[993,420],[993,425],[993,430],[993,435],[993,440],[993,445],[993,450],[993,455],[993,460],[993,465],[993,470],[992,475],[992,480],[991,485],[990,490],[989,495],[988,500],[986,505],[984,509],[981,513],[978,517],[975,521],[971,525],[968,528],[964,531],[960,535],[956,537],[952,540],[947,543],[943,545],[938,548],[934,550],[929,552],[925,554]] },
        { a: "upR", b: "rOut", px: 176.9, mids: [[814,367],[819,367],[824,367],[829,367],[834,367],[839,367],[844,367],[849,367],[854,367],[859,367],[865,367],[870,367],[875,367],[880,367],[885,367],[890,367],[895,367],[900,367],[905,367],[910,367],[915,367],[920,367],[925,367],[930,367],[935,366],[940,366],[945,366],[950,365],[955,364],[960,363],[965,361],[970,360],[975,360],[980,360]] },
        { a: "rBot", b: "midR", px: 111.0, mids: [[913,556],[906,556],[899,556],[892,556],[885,556],[878,556],[871,556],[864,556],[857,556],[850,556],[843,556],[836,556],[829,556],[822,556],[815,556]] },
    ];
    const SHORTEST_PATH_PX = 1201.4;

    const KM_PER_PX = TARGET_SHORTEST_KM / SHORTEST_PATH_PX;

    function buildAdj() {
        const adj = {};
        Object.keys(NODES).forEach((id) => { adj[id] = []; });
        for (const e of EDGE_DEFS) {
            if (!NODES[e.a] || !NODES[e.b]) continue;
            const km = Math.round(e.px * KM_PER_PX * 10) / 10;
            // เก็บ centerline ดิบ — ตอนขับค่อย offset เลน + ต่อจากรถ
            const polyAB = polyFromEdge(e, false);
            const polyBA = polyFromEdge(e, true);
            adj[e.a].push({ to: e.b, km, px: e.px, centerline: polyAB });
            adj[e.b].push({ to: e.a, km, px: e.px, centerline: polyBA });
        }
        return adj;
    }

    /**
     * วิ่งตาม **เส้นกลางถนนจริง** (medial axis จาก mask ภาพ)
     * ไม่ offset · ไม่ Bezier · ไม่ smooth หนัก
     */
    function centerlineFromEdge(e, reverse) {
        const a = NODES[e.a];
        const b = NODES[e.b];
        const mids = (e.mids || []).map((p) => ({ x: p[0], y: p[1] }));
        // ต่อเนื่องเสมอ: nodeA → mids → nodeB (จุดเดียวกันที่ junction = เส้นไม่ขาด)
        const pts = [{ x: a.x, y: a.y }];
        for (const m of mids) {
            const p = pts[pts.length - 1];
            if (Math.hypot(m.x - p.x, m.y - p.y) > 0.5) pts.push({ x: m.x, y: m.y });
        }
        const p = pts[pts.length - 1];
        if (Math.hypot(b.x - p.x, b.y - p.y) > 0.5) pts.push({ x: b.x, y: b.y });
        if (reverse) pts.reverse();
        return pts;
    }

    function polyFromEdge(e, reverse) {
        return centerlineFromEdge(e, reverse);
    }

    function polyLength(pts) {
        let L = 0;
        for (let i = 1; i < pts.length; i++) {
            L += Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y);
        }
        return L;
    }

    function normalizeAngle(a) {
        while (a > Math.PI) a -= Math.PI * 2;
        while (a < -Math.PI) a += Math.PI * 2;
        return a;
    }

    function angleDiff(from, to) {
        return normalizeAngle(to - from);
    }

    function lerpAngle(a, b, t) {
        return a + angleDiff(a, b) * t;
    }

    /** หาจุดบน polyline ที่ใกล้ (x,y) ที่สุด */
    function nearestOnPoly(pts, x, y) {
        let bestD = Infinity;
        let best = { x: pts[0].x, y: pts[0].y, idx: 1, t: 0, dist: 0 };
        for (let i = 1; i < pts.length; i++) {
            const ax = pts[i - 1].x;
            const ay = pts[i - 1].y;
            const bx = pts[i].x;
            const by = pts[i].y;
            const abx = bx - ax;
            const aby = by - ay;
            const ab2 = abx * abx + aby * aby || 1;
            let t = ((x - ax) * abx + (y - ay) * aby) / ab2;
            t = Math.max(0, Math.min(1, t));
            const px = ax + abx * t;
            const py = ay + aby * t;
            const d = Math.hypot(x - px, y - py);
            if (d < bestD) {
                bestD = d;
                best = { x: px, y: py, idx: i, t, dist: d };
            }
        }
        return best;
    }

    /**
     * ใส่ heading เรียบที่ทุกจุดบน polyline
     * - tangent จากหน้า/หลัง (ไม่ใช้ segment เดียว → ไม่สั่น)
     * - unwrap + moving average
     */
    function enrichPolyHeadings(pts) {
        if (!pts || pts.length < 2) {
            return (pts || []).map((p) => ({ x: p.x, y: p.y, angle: p.angle || 0 }));
        }
        const n = pts.length;
        const total = polyLength(pts) || 1;
        // cumulative arc length at each vertex
        const s = new Array(n);
        s[0] = 0;
        for (let i = 1; i < n; i++) {
            s[i] = s[i - 1] + Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y);
        }

        function posAt(dist) {
            const d = Math.max(0, Math.min(total, dist));
            let remain = d;
            for (let i = 1; i < n; i++) {
                const seg = s[i] - s[i - 1];
                if (remain <= seg || i === n - 1) {
                    const u = seg > 0 ? Math.min(1, remain / seg) : 0;
                    return {
                        x: pts[i - 1].x + (pts[i].x - pts[i - 1].x) * u,
                        y: pts[i - 1].y + (pts[i].y - pts[i - 1].y) * u
                    };
                }
                remain -= seg;
            }
            return { x: pts[n - 1].x, y: pts[n - 1].y };
        }

        // raw tangent: look back/forward ~28px (adaptive near ends)
        const halfWin = Math.max(18, Math.min(36, total * 0.08));
        const raw = new Array(n);
        for (let i = 0; i < n; i++) {
            const back = posAt(s[i] - halfWin);
            const fwd = posAt(s[i] + halfWin);
            let dx = fwd.x - back.x;
            let dy = fwd.y - back.y;
            if (Math.abs(dx) + Math.abs(dy) < 0.4) {
                // fallback: next/prev vertex
                if (i < n - 1) {
                    dx = pts[i + 1].x - pts[i].x;
                    dy = pts[i + 1].y - pts[i].y;
                } else {
                    dx = pts[i].x - pts[i - 1].x;
                    dy = pts[i].y - pts[i - 1].y;
                }
            }
            raw[i] = Math.atan2(dy, dx);
        }

        // unwrap for continuous smoothing
        const unwrapped = [raw[0]];
        for (let i = 1; i < n; i++) {
            let a = raw[i];
            const prev = unwrapped[i - 1];
            while (a - prev > Math.PI) a -= Math.PI * 2;
            while (a - prev < -Math.PI) a += Math.PI * 2;
            unwrapped.push(a);
        }

        // moving average on unwrapped angles (wider on long curves)
        const radius = n > 40 ? 4 : 3;
        const smooth = new Array(n);
        for (let i = 0; i < n; i++) {
            let sum = 0;
            let c = 0;
            const lo = Math.max(0, i - radius);
            const hi = Math.min(n - 1, i + radius);
            for (let j = lo; j <= hi; j++) {
                sum += unwrapped[j];
                c++;
            }
            smooth[i] = sum / c;
        }

        // จุดแรก/ท้าย: ใช้ tangent แบบ window — อย่าเชื่อ micro-segment ที่ junction
        // (segment สั้น ๆ ใกล้ node มักชี้ผิดทิศจาก polyline densify)
        if (n >= 2) {
            const firstLen = Math.hypot(pts[1].x - pts[0].x, pts[1].y - pts[0].y);
            let startA;
            if (firstLen >= 12) {
                startA = Math.atan2(pts[1].y - pts[0].y, pts[1].x - pts[0].x);
            } else {
                // look-forward window จากต้นทาง
                const a = posAt(0);
                const b = posAt(Math.min(total, halfWin * 1.25));
                startA = Math.atan2(b.y - a.y, b.x - a.x);
            }
            if (n > 2) {
                while (startA - smooth[1] > Math.PI) startA -= Math.PI * 2;
                while (startA - smooth[1] < -Math.PI) startA += Math.PI * 2;
            }
            smooth[0] = startA;

            const endBack = posAt(Math.max(0, total - halfWin));
            const endFwd = posAt(total);
            let endA = Math.atan2(endFwd.y - endBack.y, endFwd.x - endBack.x);
            while (endA - smooth[n - 2] > Math.PI) endA -= Math.PI * 2;
            while (endA - smooth[n - 2] < -Math.PI) endA += Math.PI * 2;
            smooth[n - 1] = endA;
        }

        return pts.map((p, i) => ({
            x: p.x,
            y: p.y,
            angle: smooth[i],
            s: s[i]
        }));
    }

    /**
     * เส้นขับต่อเนื่อง:
     * - เริ่มจากตำแหน่งรถปัจจุบัน (ไม่กระโดด)
     * - ต่อเข้า centerline แล้ววิ่งถึงปลาย
     * - ใส่ heading เรียบทุกจุด
     */
    function buildDrivePath(carX, carY, carAngle, centerline, isReverse) {
        if (!centerline || centerline.length < 2) {
            return enrichPolyHeadings([{ x: carX, y: carY }]);
        }

        const pts = centerline.map((p) => ({ x: p.x, y: p.y }));
        const dStart = Math.hypot(carX - pts[0].x, carY - pts[0].y);
        const dEnd = Math.hypot(carX - pts[pts.length - 1].x, carY - pts[pts.length - 1].y);

        const path = [{ x: carX, y: carY }];
        if (dStart <= 36 || dStart <= dEnd + 8) {
            if (dStart > 1.5) path.push({ x: pts[0].x, y: pts[0].y });
            for (let i = 1; i < pts.length; i++) {
                const p = pts[i];
                const last = path[path.length - 1];
                if (Math.hypot(p.x - last.x, p.y - last.y) > 0.5) path.push(p);
            }
        } else {
            const near = nearestOnPoly(pts, carX, carY);
            if (Math.hypot(near.x - carX, near.y - carY) > 1.5) {
                path.push({ x: near.x, y: near.y });
            }
            for (let i = near.idx; i < pts.length; i++) {
                const p = pts[i];
                const last = path[path.length - 1];
                if (Math.hypot(p.x - last.x, p.y - last.y) > 0.5) path.push(p);
            }
        }

        if (path.length < 2) return enrichPolyHeadings(pts);
        return enrichPolyHeadings(path);
    }

    /**
     * จุดบน polyline ตาม t∈[0,1] + มุมจาก profile ที่คำนวณไว้
     * (ไม่ใช้ look-ahead สดทุกเฟรม → ไม่สั่น)
     */
    function pointOnPoly(pts, t) {
        if (!pts.length) return { x: 0, y: 0, angle: 0 };
        if (pts.length === 1) {
            return { x: pts[0].x, y: pts[0].y, angle: pts[0].angle || 0 };
        }
        const total = polyLength(pts) || 1;
        const dist = Math.max(0, Math.min(1, t)) * total;
        return samplePolyAt(pts, dist);
    }

    function samplePolyAt(pts, dist) {
        let remain = Math.max(0, dist);
        for (let i = 1; i < pts.length; i++) {
            const seg = Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y);
            const a0 = pts[i - 1].angle != null
                ? pts[i - 1].angle
                : Math.atan2(pts[i].y - pts[i - 1].y, pts[i].x - pts[i - 1].x);
            const a1 = pts[i].angle != null
                ? pts[i].angle
                : Math.atan2(pts[i].y - pts[i - 1].y, pts[i].x - pts[i - 1].x);
            if (remain <= seg || i === pts.length - 1) {
                const u = seg > 0 ? Math.min(1, remain / seg) : 0;
                return {
                    x: pts[i - 1].x + (pts[i].x - pts[i - 1].x) * u,
                    y: pts[i - 1].y + (pts[i].y - pts[i - 1].y) * u,
                    angle: lerpAngle(a0, a1, u),
                    segAngle: a0
                };
            }
            remain -= seg;
        }
        const last = pts[pts.length - 1];
        const prev = pts[pts.length - 2] || last;
        return {
            x: last.x,
            y: last.y,
            angle: last.angle != null
                ? last.angle
                : Math.atan2(last.y - prev.y, last.x - prev.x),
            segAngle: last.angle || 0
        };
    }

    class ShortestPathMiniGame {
        constructor() {
            this.overlay = null;
            this.canvas = null;
            this.ctx = null;
            this.hudDist = null;
            this.hudStatus = null;
            this.btnFinish = null;
            this.dirBar = null;
            this.hintEl = null;

            this.mapImg = null;
            this.adj = buildAdj();
            this.scale = 1;
            this.cssScale = 1;
            this.dpr = 1;
            this.padX = 0;
            this.padY = 0;
            this.drawW = 0;
            this.drawH = 0;

            this.running = false;
            this.finished = false;
            this.animating = false;
            this.raf = 0;
            this._lastTs = 0;

            this.currentId = "home";
            this.distanceKm = 0;
            this.path = ["home"];
            /** จุดเส้นทางที่เดินแล้ว — ต่อเนื่องเส้นเดียว */
            this.trailPoints = [];
            /** ความยาว trail ก่อนเริ่มแต่ละช่วง (สำหรับ undo) */
            this.trailMarks = [];
            this.car = { x: NODES.home.x, y: NODES.home.y, angle: 0 };
            this.anim = null;
            this._slotOpts = [];

            this._onResize = this._onResize.bind(this);
            this._onKeyDown = this._onKeyDown.bind(this);
            this._onPointer = this._onPointer.bind(this);
            this._loop = this._loop.bind(this);
        }

        ensureDom() {
            if (this.overlay) return;

            const root = document.getElementById("game-container") || document.body;
            const el = document.createElement("div");
            el.id = "shortest-path-minigame";
            el.className = "sp-minigame hidden";
            el.innerHTML = `
                <div class="sp-shell sp-shell-split">
                    <header class="sp-header">
                        <div class="sp-title">
                            <span class="sp-badge">Mini Game · สถานการณ์</span>
                            <h2>ระยะทางที่สั้นที่สุด</h2>
                            <p>กดเลือกทางทีละจุด · หาเส้นทางสั้นสุดจากบ้านไปโรงเรียน</p>
                        </div>
                        <div class="sp-stats">
                            <div class="sp-stat">
                                <span class="sp-stat-label">ระยะทางสะสม</span>
                                <span class="sp-stat-value" id="sp-dist">0.0 กม.</span>
                            </div>
                            <div class="sp-stat">
                                <span class="sp-stat-label">สถานะ</span>
                                <span class="sp-stat-value" id="sp-status">ที่บ้าน</span>
                            </div>
                        </div>
                        <button type="button" class="btn btn-secondary sp-btn-close" id="sp-close" title="ปิด">✕</button>
                    </header>
                    <div class="sp-body">
                        <div class="sp-stage">
                            <canvas id="sp-canvas" width="960" height="640"></canvas>
                        </div>
                        <aside class="sp-side">
                            <div class="sp-side-title">เลือกทิศทาง</div>
                            <p class="sp-side-help" id="sp-hint">
                                กดปุ่มด้านขวา หรือจุดเรืองแสงบนแผนที่ — เดินทีละช่วง · ถึงทางแยกเลือกเลี้ยวได้
                            </p>
                            <div class="sp-dirbar sp-dirbar-side" id="sp-dirbar" aria-label="เลือกทิศทาง"></div>
                            <div class="sp-side-actions">
                                <button type="button" class="btn btn-secondary" id="sp-undo">↩ ถอย 1 จุด</button>
                                <button type="button" class="btn btn-secondary" id="sp-reset">🔄 เริ่มใหม่</button>
                                <button type="button" class="btn btn-primary hidden" id="sp-finish">ไปตอบคำถาม</button>
                            </div>
                        </aside>
                    </div>
                </div>
            `;
            root.appendChild(el);

            this.overlay = el;
            this.canvas = el.querySelector("#sp-canvas");
            this.ctx = this.canvas.getContext("2d");
            this.hudDist = el.querySelector("#sp-dist");
            this.hudStatus = el.querySelector("#sp-status");
            this.btnFinish = el.querySelector("#sp-finish");
            this.dirBar = el.querySelector("#sp-dirbar");
            this.hintEl = el.querySelector("#sp-hint");

            el.querySelector("#sp-close").addEventListener("click", () => this.close());
            el.querySelector("#sp-reset").addEventListener("click", () => this.reset());
            el.querySelector("#sp-undo").addEventListener("click", () => this.undo());
            this.btnFinish.addEventListener("click", () => this.closeAndContinue());
            this.canvas.addEventListener("pointerup", this._onPointer);
        }

        /** ปิด mini-game แล้วปิด scenario ไปตอบคำถาม */
        closeAndContinue() {
            this.close();
            if (typeof closeScenarioOverlay === "function") {
                // อย่าปิด mini ซ้ำ — closeScenario เรียก close mini ได้อยู่แล้ว
                const overlay = document.getElementById("scenario-overlay");
                if (overlay) overlay.classList.add("hidden");
            }
        }

        async open() {
            this.ensureDom();
            this.overlay.classList.remove("hidden");
            this.finished = false;
            if (this.btnFinish) this.btnFinish.classList.add("hidden");

            if (!this.mapImg) {
                if (this.hudStatus) this.hudStatus.textContent = "กำลังโหลด...";
                try {
                    this.mapImg = await this._loadImage(MAP_SRC);
                } catch (err) {
                    console.error(err);
                    if (this.hudStatus) this.hudStatus.textContent = "โหลดแผนที่ไม่สำเร็จ";
                    return;
                }
            }

            // layout หลังแสดง DOM หนึ่งเฟรม เพื่อได้ขนาดจริง
            requestAnimationFrame(() => {
                this._layoutCanvas();
                this.reset();
                this.running = true;
                this._lastTs = 0;
                window.addEventListener("keydown", this._onKeyDown, true);
                window.addEventListener("resize", this._onResize);
                cancelAnimationFrame(this.raf);
                this.raf = requestAnimationFrame(this._loop);
            });
        }

        close() {
            this.running = false;
            cancelAnimationFrame(this.raf);
            window.removeEventListener("keydown", this._onKeyDown, true);
            window.removeEventListener("resize", this._onResize);
            if (this.overlay) this.overlay.classList.add("hidden");
        }

        isOpen() {
            return !!(this.overlay && !this.overlay.classList.contains("hidden"));
        }

        reset() {
            this.currentId = "home";
            this.distanceKm = 0;
            this.path = ["home"];
            this.trailPoints = [];
            this.trailMarks = [];
            this.finished = false;
            this.animating = false;
            this.anim = null;
            const n = NODES.home;
            this.car.angle = 0;
            this.car.x = n.x;
            this.car.y = n.y;
            if (this.btnFinish) this.btnFinish.classList.add("hidden");
            if (this.hintEl) {
                this.hintEl.innerHTML =
                    "กดปุ่มด้านขวา = ไปจุดนั้น · เลขบนแผนที่ตรงกับปุ่ม";
            }
            this._refreshHud();
            this._renderDirButtons();
        }

        undo() {
            if (this.animating || this.path.length <= 1) return;
            const prev = this.path[this.path.length - 2];
            const cur = this.path[this.path.length - 1];
            const edge = (this.adj[cur] || []).find((e) => e.to === prev);
            if (edge) this.distanceKm = Math.max(0, Math.round((this.distanceKm - edge.km) * 10) / 10);
            this.path.pop();
            // ตัด trail กลับไป mark ก่อนหน้า
            if (this.trailMarks.length) {
                const mark = this.trailMarks.pop();
                this.trailPoints = this.trailPoints.slice(0, mark);
            }
            this.currentId = prev;
            if (this.trailPoints.length >= 2) {
                const a = this.trailPoints[this.trailPoints.length - 2];
                const b = this.trailPoints[this.trailPoints.length - 1];
                this.car.x = b.x;
                this.car.y = b.y;
                this.car.angle = Math.atan2(b.y - a.y, b.x - a.x);
            } else {
                const n = NODES[prev];
                this.car.x = n.x;
                this.car.y = n.y;
            }
            this.finished = false;
            if (this.btnFinish) this.btnFinish.classList.add("hidden");
            // ล้างข้อความ "ถึงโรงเรียนแล้ว" หลังถอยกลับ
            if (this.hintEl) {
                this.hintEl.innerHTML =
                    "กดปุ่มด้านขวา = ไปจุดนั้น · เลขบนแผนที่ตรงกับปุ่ม";
            }
            this._refreshHud();
            this._renderDirButtons();
        }

        _loadImage(src) {
            return new Promise((resolve, reject) => {
                const img = new Image();
                img.onload = () => resolve(img);
                img.onerror = () => reject(new Error("Failed to load " + src));
                img.src = src;
            });
        }

        _layoutCanvas() {
            if (!this.overlay || !this.canvas || !this.mapImg) return;
            const stage = this.overlay.querySelector(".sp-stage");
            const maxW = stage ? Math.max(120, stage.clientWidth - 10) : 700;
            const maxH = stage ? Math.max(160, stage.clientHeight - 10) : 640;
            const iw = this.mapImg.naturalWidth || MAP_W;
            const ih = this.mapImg.naturalHeight || MAP_H;

            const s = Math.min(maxW / iw, maxH / ih);
            const cssW = Math.max(1, Math.floor(iw * s));
            const cssH = Math.max(1, Math.floor(ih * s));

            const dpr = Math.min(2, window.devicePixelRatio || 1);
            this.drawW = cssW;
            this.drawH = cssH;
            this.canvas.width = Math.floor(cssW * dpr);
            this.canvas.height = Math.floor(cssH * dpr);
            this.canvas.style.width = cssW + "px";
            this.canvas.style.height = cssH + "px";
            this.canvas.style.maxWidth = "none";
            this.canvas.style.maxHeight = "none";

            this.scale = s * dpr;
            this.cssScale = s;
            this.dpr = dpr;
            this.padX = 0;
            this.padY = 0;
        }

        _onResize() {
            if (!this.running) return;
            this._layoutCanvas();
        }

        _onKeyDown(e) {
            if (!this.running) return;
            if (e.code === "Escape") {
                e.preventDefault();
                e.stopPropagation();
                this.closeAndContinue();
                return;
            }
            if (this.animating || this.finished) return;

            // 1–9 = ลำดับปุ่มปลายทางในรายการ
            const map = {
                Digit1: 0, Digit2: 1, Digit3: 2, Digit4: 3,
                Digit5: 4, Digit6: 5, Digit7: 6, Digit8: 7, Digit9: 8,
                Numpad1: 0, Numpad2: 1, Numpad3: 2, Numpad4: 3,
                Numpad5: 4, Numpad6: 5, Numpad7: 6, Numpad8: 7, Numpad9: 8
            };
            if (e.code in map) {
                const idx = map[e.code];
                const slotOpts = this._slotOpts || [];
                if (slotOpts[idx]) {
                    e.preventDefault();
                    e.stopPropagation();
                    this._moveTo(slotOpts[idx]);
                }
            }
            if (e.code === "KeyZ" || e.code === "Backspace") {
                e.preventDefault();
                this.undo();
            }
            if (e.code === "KeyR") {
                e.preventDefault();
                this.reset();
            }
        }

        _canvasToMap(clientX, clientY) {
            const rect = this.canvas.getBoundingClientRect();
            const cssW = rect.width || this.drawW || 1;
            const cssH = rect.height || this.drawH || 1;
            const mx = ((clientX - rect.left) / cssW) * MAP_W;
            const my = ((clientY - rect.top) / cssH) * MAP_H;
            return { x: mx, y: my };
        }

        _onPointer(e) {
            if (!this.running || this.animating || this.finished) return;
            if (e.button != null && e.button !== 0) return;
            const p = this._canvasToMap(e.clientX, e.clientY);
            const opts = this._neighborOptions();
            const cssS = this.cssScale || 1;
            const hitR = Math.max(30, 32 / cssS);
            let best = null;
            let bestD = hitR;
            for (const o of opts) {
                const n = NODES[o.to];
                const d = Math.hypot(p.x - n.x, p.y - n.y);
                if (d < bestD) {
                    bestD = d;
                    best = o;
                }
            }
            if (best) this._moveTo(best);
        }

        _neighborOptions() {
            const isBackTo = (toId) =>
                this.path.length >= 2 && this.path[this.path.length - 2] === toId;

            return (this.adj[this.currentId] || []).map((e) => {
                const n = NODES[e.to];
                const cur = NODES[this.currentId];
                const dx = n.x - cur.x;
                const dy = n.y - cur.y;
                const reverse = isBackTo(e.to);
                // preview path จากตำแหน่งรถปัจจุบัน ชิดเลน
                const drivePoly = buildDrivePath(
                    this.car.x,
                    this.car.y,
                    this.car.angle,
                    e.centerline,
                    reverse
                );
                return {
                    to: e.to,
                    km: e.km,
                    px: e.px,
                    centerline: e.centerline,
                    poly: drivePoly,
                    reverse,
                    dx,
                    dy,
                    dirLabel: this._dirLabel(dx, dy),
                    node: n
                };
            });
        }

        _dirLabel(dx, dy) {
            const c = this._cardinal(dx, dy);
            if (c === "up") return "ขึ้น ↑";
            if (c === "down") return "ลง ↓";
            if (c === "right") return "ขวา →";
            if (c === "left") return "ซ้าย ←";
            return "ไปต่อ";
        }

        /** ทิศหลัก 4 ทาง สำหรับใส่ช่องปุ่ม */
        _cardinal(dx, dy) {
            if (Math.abs(dx) >= Math.abs(dy)) {
                return dx >= 0 ? "right" : "left";
            }
            return dy >= 0 ? "down" : "up";
        }

        _moveTo(opt) {
            if (this.animating || this.finished || !opt) return;
            const reverse = !!(opt.reverse ||
                (this.path.length >= 2 && this.path[this.path.length - 2] === opt.to));
            // เริ่มจากตำแหน่งรถปัจจุบัน — ไม่ snap กระโดด
            let poly = buildDrivePath(
                this.car.x,
                this.car.y,
                this.car.angle,
                opt.centerline || opt.poly,
                reverse
            );
            if (!poly || poly.length < 2) return;

            // บังคับจุดแรก = ตำแหน่งรถจริง แล้วคำนวณ heading ใหม่ทั้งเส้น
            poly[0] = { x: this.car.x, y: this.car.y };
            poly = enrichPolyHeadings(poly);

            // ระยะทาง + โค้ง → เวลาวิ่ง (โค้งยาว/หักเยอะ ช้าลงนิดให้หันทัน)
            const lenPx = polyLength(poly) || 1;
            let turnBudget = 0;
            for (let i = 1; i < poly.length; i++) {
                if (poly[i].angle == null || poly[i - 1].angle == null) continue;
                turnBudget += Math.abs(angleDiff(poly[i - 1].angle, poly[i].angle));
            }
            const baseDur = Math.min(2.4, 0.6 + opt.km * 0.26);
            const curveBonus = Math.min(0.7, turnBudget * 0.22);
            const duration = Math.max(0.6, baseDur + curveBonus);

            const pathStartAng = poly[0].angle != null
                ? poly[0].angle
                : Math.atan2(poly[1].y - poly[0].y, poly[1].x - poly[0].x);
            const turnNeeded = Math.abs(angleDiff(this.car.angle, pathStartAng));
            // เลี้ยวก่อนออกตัวเมื่อมุมต่างมาก (junction 90°/กลับรถ)
            const preTurnDur = turnNeeded > 0.35
                ? Math.min(0.55, Math.max(0.12, turnNeeded / 4.2))
                : 0;

            this.animating = true;
            this.anim = {
                toId: opt.to,
                km: opt.km,
                poly,
                t: 0,
                duration,
                fromAngle: this.car.angle,
                pathStartAng,
                preTurnDur,
                preTurnT: 0,
                // look-ahead บน profile (px) — หมุนล่วงหน้าก่อนเข้าโค้ง
                steerAheadPx: Math.max(22, Math.min(48, lenPx * 0.07)),
                // โค้งเยอะ → ใช้ ease น้อยลง (ความเร็วคงที่กว่า หันทัน)
                linearMix: Math.min(0.85, turnBudget / Math.PI)
            };
            if (this.hudStatus) this.hudStatus.textContent = "กำลังไป...";
            this._renderDirButtons();
        }

        _finishMove() {
            if (!this.anim) return;
            const { toId, km, poly } = this.anim;
            this.currentId = toId;
            this.distanceKm = Math.round((this.distanceKm + km) * 10) / 10;
            this.path.push(toId);

            // ต่อ trailPoints เป็นเส้นเดียว — ข้ามจุดแรกถ้าชนกับปลายเดิม
            this.trailMarks.push(this.trailPoints.length);
            if (!this.trailPoints.length) {
                for (const p of poly) this.trailPoints.push({ x: p.x, y: p.y });
            } else {
                for (let i = 0; i < poly.length; i++) {
                    const p = poly[i];
                    const last = this.trailPoints[this.trailPoints.length - 1];
                    if (Math.hypot(p.x - last.x, p.y - last.y) > 1.2) {
                        this.trailPoints.push({ x: p.x, y: p.y });
                    }
                }
            }

            const end = poly[poly.length - 1];
            this.car.x = end.x;
            this.car.y = end.y;
            // ใช้ heading จาก profile (ไม่ใช้ segment สุดท้ายที่สั้น/หัก)
            if (end.angle != null) {
                this.car.angle = normalizeAngle(end.angle);
            } else {
                const prev = poly[poly.length - 2] || end;
                this.car.angle = Math.atan2(end.y - prev.y, end.x - prev.x);
            }
            this.anim = null;
            this.animating = false;

            if (toId === "school" || (NODES[toId] && NODES[toId].kind === "school")) {
                this._onArrive();
            } else {
                this._refreshHud();
                this._renderDirButtons();
            }
        }

        _onArrive() {
            this.finished = true;
            this._refreshHud();
            if (this.hudStatus) this.hudStatus.textContent = "ถึงโรงเรียนแล้ว!";
            const rounded = Math.round(this.distanceKm * 10) / 10;
            if (this.hintEl) {
                this.hintEl.innerHTML =
                    `🎉 ถึงโรงเรียนแล้ว! ระยะทางสะสม <strong>${rounded.toFixed(1)} กม.</strong> — กด «ไปตอบคำถาม» หรือลองเส้นทางอื่นด้วย «เริ่มใหม่»`;
            }
            if (this.btnFinish) this.btnFinish.classList.remove("hidden");
            this._renderDirButtons();
        }

        _refreshHud() {
            if (this.hudDist) this.hudDist.textContent = this.distanceKm.toFixed(1) + " กม.";
            if (this.hudStatus && !this.finished) {
                const opts = this._neighborOptions();
                if (this.currentId === "home") this.hudStatus.textContent = "ที่บ้าน — เลือกทางออก";
                else if (opts.length >= 3) this.hudStatus.textContent = "ทางแยก — เลือกเลี้ยวได้";
                else if (opts.length === 2) this.hudStatus.textContent = "เลือกทางตรงหรือเลี้ยว";
                else {
                    const n = NODES[this.currentId];
                    this.hudStatus.textContent = (n && n.label) || "เลือกจุดถัดไป";
                }
            }
        }

        _destName(opt) {
            if (!opt) return "—";
            if (this.path.length >= 2 && this.path[this.path.length - 2] === opt.to) {
                return "ย้อนกลับ";
            }
            const n = opt.node || NODES[opt.to];
            return (n && n.label) || opt.to;
        }

        _renderDirButtons() {
            if (!this.dirBar) return;
            this.dirBar.innerHTML = "";
            // รายการแนวตั้ง — ปุ่ม = ปลายทางชัดเจน (ไม่ใช้ตารางทิศว่าง ๆ)
            this.dirBar.className = "sp-dirbar sp-dirbar-side sp-dir-list";

            if (this.finished) {
                this.dirBar.innerHTML = `<div class="sp-dir-empty">ถึงโรงเรียนแล้ว — กด «เริ่มใหม่» หรือ «ไปตอบคำถาม»</div>`;
                this._slotOpts = [];
                return;
            }
            if (this.animating) {
                this.dirBar.innerHTML = `<div class="sp-dir-empty">กำลังเคลื่อนที่ตามถนน...</div>`;
                this._slotOpts = [];
                return;
            }

            const opts = this._neighborOptions();
            // เรียง: ไม่ย้อนกลับก่อน แล้วย้อนกลับท้าย
            const ordered = opts.slice().sort((a, b) => {
                const ab = this.path.length >= 2 && this.path[this.path.length - 2] === a.to ? 1 : 0;
                const bb = this.path.length >= 2 && this.path[this.path.length - 2] === b.to ? 1 : 0;
                return ab - bb;
            });

            if (!ordered.length) {
                this.dirBar.innerHTML = `<div class="sp-dir-empty">ไม่มีทางต่อ — กดถอยกลับ</div>`;
                this._slotOpts = [];
                return;
            }

            this._slotOpts = ordered;
            ordered.forEach((o, i) => {
                const btn = document.createElement("button");
                btn.type = "button";
                btn.className = "sp-dir-btn sp-dir-dest";
                const isBack = this.path.length >= 2 && this.path[this.path.length - 2] === o.to;
                if (isBack) btn.classList.add("sp-dir-back");
                else if (ordered.length >= 3) btn.classList.add("sp-dir-turn");

                const dest = this._destName(o);
                const arrow = o.dirLabel;
                btn.innerHTML = `
                    <span class="sp-dir-key">${i + 1}</span>
                    <span class="sp-dir-main">
                        <span class="sp-dir-arrow">ไป ${dest}</span>
                        <span class="sp-dir-meta">${arrow} · ${o.km.toFixed(1)} กม.</span>
                    </span>
                `;
                btn.title = `กดแล้วรถจะไปที่ «${dest}» (${o.km.toFixed(1)} กม.)`;
                btn.addEventListener("click", () => this._moveTo(o));
                this.dirBar.appendChild(btn);
            });
        }

        _loop(ts) {
            if (!this.running) return;
            if (!this._lastTs) this._lastTs = ts;
            const dt = Math.min(0.05, (ts - this._lastTs) / 1000);
            this._lastTs = ts;

            if (this.animating && this.anim) {
                const anim = this.anim;
                // 1) หันเข้าทิศทางออกก่อน ถ้ามุมต่างมาก (junction)
                if (anim.preTurnDur > 0 && anim.preTurnT < 1) {
                    anim.preTurnT = Math.min(1, anim.preTurnT + dt / anim.preTurnDur);
                    const u = anim.preTurnT;
                    const s = u * u * (3 - 2 * u);
                    this.car.angle = lerpAngle(anim.fromAngle, anim.pathStartAng, s);
                    // ค้างตำแหน่งจนกว่าจะหันใกล้ทิศทาง
                    if (anim.preTurnT < 1) {
                        this._draw();
                        this.raf = requestAnimationFrame(this._loop);
                        return;
                    }
                    // เริ่มวิ่งจากมุมที่หันแล้ว
                    anim.fromAngle = this.car.angle;
                }

                anim.t += dt / anim.duration;
                const t = Math.min(1, anim.t);
                // ease ผสม linear เมื่อโค้งเยอะ — ไม่พุ่งเร็วกลางโค้งจนหันไม่ทัน
                const ease = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
                const lin = anim.linearMix || 0;
                const e = ease * (1 - lin) + t * lin;

                const poly = anim.poly;
                const total = polyLength(poly) || 1;
                const dist = e * total;
                const p = samplePolyAt(poly, dist);
                this.car.x = p.x;
                this.car.y = p.y;

                // หมุนล่วงหน้าตาม profile (look-ahead บนเส้น)
                const ahead = Math.min(total, dist + (anim.steerAheadPx || 30));
                const steer = samplePolyAt(poly, ahead);
                let targetAng = steer.angle;

                const dAng = angleDiff(this.car.angle, targetAng);
                // adaptive: หันเร็วขึ้นเมื่อมุมต่างมาก, ช้าลงเมื่อใกล้ตรง
                const urgency = Math.min(1, Math.abs(dAng) / (Math.PI * 0.5));
                const maxTurn = (5.5 + 6.0 * urgency) * dt; // ~315–660°/s
                const follow = Math.min(1, (14 + 10 * urgency) * dt);
                const step = Math.abs(dAng) * follow;
                if (step <= maxTurn) {
                    this.car.angle = lerpAngle(this.car.angle, targetAng, follow);
                } else {
                    this.car.angle = normalizeAngle(
                        this.car.angle + Math.sign(dAng) * maxTurn
                    );
                }
                if (t >= 1) this._finishMove();
            }

            this._draw();
            this.raf = requestAnimationFrame(this._loop);
        }

        _draw() {
            const ctx = this.ctx;
            if (!ctx || !this.mapImg) return;
            const w = this.canvas.width;
            const h = this.canvas.height;
            ctx.setTransform(1, 0, 0, 1, 0, 0);
            ctx.clearRect(0, 0, w, h);
            ctx.drawImage(this.mapImg, this.padX, this.padY, w, h);

            ctx.save();
            ctx.translate(this.padX, this.padY);
            ctx.scale(this.scale, this.scale);

            ctx.lineCap = "round";
            ctx.lineJoin = "round";
            // เส้นเขียว = trailPoints ต่อเนื่อง + ช่วงที่กำลังวิ่ง
            ctx.strokeStyle = "rgba(46, 204, 113, 0.95)";
            ctx.lineWidth = 4;
            ctx.beginPath();
            let started = false;
            const pts = this.trailPoints || [];
            for (let i = 0; i < pts.length; i++) {
                if (!started) {
                    ctx.moveTo(pts[i].x, pts[i].y);
                    started = true;
                } else {
                    ctx.lineTo(pts[i].x, pts[i].y);
                }
            }
            if (this.animating && this.anim) {
                const t = Math.min(1, this.anim.t);
                const e = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
                const partial = this._partialPoly(this.anim.poly, e);
                if (partial && partial.length) {
                    for (let i = 0; i < partial.length; i++) {
                        if (!started) {
                            ctx.moveTo(partial[i].x, partial[i].y);
                            started = true;
                        } else {
                            ctx.lineTo(partial[i].x, partial[i].y);
                        }
                    }
                }
            }
            if (started) ctx.stroke();

            if (!this.animating && !this.finished) {
                // ใช้ลำดับเดียวกับปุ่มด้านขวา
                const opts = this._slotOpts && this._slotOpts.length
                    ? this._slotOpts
                    : this._neighborOptions();
                const pulse = 0.55 + 0.45 * Math.sin(performance.now() / 280);
                opts.forEach((o, i) => {
                    if (!o) return;
                    const n = o.node;
                    const isBack = this.path.length >= 2 && this.path[this.path.length - 2] === o.to;
                    const dest = this._destName(o);

                    if (o.poly && o.poly.length >= 2) {
                        ctx.setLineDash([6, 5]);
                        ctx.strokeStyle = isBack ? "rgba(149,165,166,0.7)" : "rgba(30,144,255,0.75)";
                        ctx.lineWidth = 3.5;
                        ctx.beginPath();
                        const half = this._partialPoly(o.poly, 0.65);
                        ctx.moveTo(half[0].x, half[0].y);
                        for (let j = 1; j < half.length; j++) ctx.lineTo(half[j].x, half[j].y);
                        ctx.stroke();
                        ctx.setLineDash([]);
                    }

                    ctx.beginPath();
                    ctx.arc(n.x, n.y, 18, 0, Math.PI * 2);
                    ctx.fillStyle = isBack
                        ? `rgba(149, 165, 166, ${0.28 + 0.2 * pulse})`
                        : `rgba(30, 144, 255, ${0.32 + 0.25 * pulse})`;
                    ctx.fill();
                    ctx.lineWidth = 2.5;
                    ctx.strokeStyle = isBack ? "#95a5a6" : "#1e90ff";
                    ctx.stroke();

                    ctx.beginPath();
                    ctx.arc(n.x, n.y, 8, 0, Math.PI * 2);
                    ctx.fillStyle = isBack ? "#bdc3c7" : "#ffd700";
                    ctx.fill();
                    ctx.strokeStyle = "#1a1a1a";
                    ctx.lineWidth = 1.5;
                    ctx.stroke();

                    ctx.font = "bold 12px Kanit, sans-serif";
                    ctx.textAlign = "center";
                    ctx.textBaseline = "middle";
                    ctx.fillStyle = "#0c0e17";
                    ctx.fillText(String(i + 1), n.x, n.y);

                    // ป้าย: ไปที่ไหน · ระยะ
                    const label = `ไป ${dest} · ${o.km.toFixed(1)}กม.`;
                    ctx.font = "bold 12px Kanit, sans-serif";
                    ctx.lineWidth = 3;
                    ctx.strokeStyle = "rgba(255,255,255,0.92)";
                    ctx.fillStyle = "#0c0e17";
                    ctx.strokeText(label, n.x, n.y - 28);
                    ctx.fillText(label, n.x, n.y - 28);
                });
            }

            if (!this.animating) {
                const cur = NODES[this.currentId];
                if (cur) {
                    ctx.beginPath();
                    ctx.arc(cur.x, cur.y, 12, 0, Math.PI * 2);
                    ctx.fillStyle = "rgba(46, 204, 113, 0.35)";
                    ctx.fill();
                    ctx.lineWidth = 2.5;
                    ctx.strokeStyle = "#2ecc71";
                    ctx.stroke();
                }
            }

            this._drawLabel(ctx, NODES.home.x, NODES.home.y - 40, "🏠 บ้าน", "#2ecc71");
            this._drawLabel(ctx, NODES.school.x, NODES.school.y - 44, "🏫 โรงเรียน", "#f1c40f");
            this._drawCar(ctx, this.car);
            ctx.restore();

            ctx.strokeStyle = "rgba(255, 215, 0, 0.3)";
            ctx.lineWidth = 2;
            ctx.strokeRect(1, 1, w - 2, h - 2);
        }

        _partialPoly(poly, t) {
            if (!poly || poly.length < 2) return poly || [];
            const total = polyLength(poly) || 1;
            const target = Math.max(0, Math.min(1, t)) * total;
            const out = [{ x: poly[0].x, y: poly[0].y }];
            let acc = 0;
            for (let i = 1; i < poly.length; i++) {
                const seg = Math.hypot(poly[i].x - poly[i - 1].x, poly[i].y - poly[i - 1].y);
                if (acc + seg >= target) {
                    const u = seg > 0 ? (target - acc) / seg : 0;
                    out.push({
                        x: poly[i - 1].x + (poly[i].x - poly[i - 1].x) * u,
                        y: poly[i - 1].y + (poly[i].y - poly[i - 1].y) * u
                    });
                    return out;
                }
                out.push({ x: poly[i].x, y: poly[i].y });
                acc += seg;
            }
            return out;
        }

        _drawLabel(ctx, x, y, text, color) {
            ctx.font = "bold 14px Kanit, sans-serif";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            const tw = ctx.measureText(text).width;
            ctx.fillStyle = "rgba(12,14,23,0.75)";
            ctx.beginPath();
            if (ctx.roundRect) ctx.roundRect(x - tw / 2 - 8, y - 11, tw + 16, 22, 6);
            else ctx.rect(x - tw / 2 - 8, y - 11, tw + 16, 22);
            ctx.fill();
            ctx.fillStyle = color;
            ctx.fillText(text, x, y);
        }

        _drawCar(ctx, car) {
            ctx.save();
            ctx.translate(car.x, car.y);
            ctx.rotate(car.angle);
            const L = 26;
            const W = 14;
            ctx.fillStyle = "rgba(0,0,0,0.25)";
            ctx.beginPath();
            if (ctx.roundRect) ctx.roundRect(-L / 2 + 2, -W / 2 + 2, L, W, 4);
            else ctx.rect(-L / 2 + 2, -W / 2 + 2, L, W);
            ctx.fill();

            const grad = ctx.createLinearGradient(-L / 2, 0, L / 2, 0);
            grad.addColorStop(0, "#e74c3c");
            grad.addColorStop(1, "#c0392b");
            ctx.fillStyle = grad;
            ctx.strokeStyle = "#5c1a14";
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            if (ctx.roundRect) ctx.roundRect(-L / 2, -W / 2, L, W, 4);
            else ctx.rect(-L / 2, -W / 2, L, W);
            ctx.fill();
            ctx.stroke();

            ctx.fillStyle = "rgba(40,60,90,0.9)";
            ctx.beginPath();
            if (ctx.roundRect) ctx.roundRect(-L * 0.1, -W * 0.3, L * 0.35, W * 0.6, 3);
            else ctx.rect(-L * 0.1, -W * 0.3, L * 0.35, W * 0.6);
            ctx.fill();

            ctx.fillStyle = "#ffeaa7";
            ctx.fillRect(L / 2 - 4, -W / 2 + 2, 4, 3);
            ctx.fillRect(L / 2 - 4, W / 2 - 5, 4, 3);

            ctx.fillStyle = "#fff";
            ctx.beginPath();
            ctx.moveTo(L / 2 + 2, 0);
            ctx.lineTo(L / 2 - 5, -3);
            ctx.lineTo(L / 2 - 5, 3);
            ctx.closePath();
            ctx.fill();
            ctx.restore();
        }
    }

    if (typeof CanvasRenderingContext2D !== "undefined" && !CanvasRenderingContext2D.prototype.roundRect) {
        CanvasRenderingContext2D.prototype.roundRect = function (x, y, w, h, r) {
            const radius = typeof r === "number" ? r : 4;
            this.moveTo(x + radius, y);
            this.arcTo(x + w, y, x + w, y + h, radius);
            this.arcTo(x + w, y + h, x, y + h, radius);
            this.arcTo(x, y + h, x, y, radius);
            this.arcTo(x, y, x + w, y, radius);
            this.closePath();
            return this;
        };
    }

    const instance = new ShortestPathMiniGame();
    global.ShortestPathMiniGame = instance;
    global.openShortestPathMiniGame = function () { return instance.open(); };
    global.closeShortestPathMiniGame = function () { instance.close(); };
    global.isShortestPathMiniGameOpen = function () { return instance.isOpen(); };
})(typeof window !== "undefined" ? window : globalThis);
