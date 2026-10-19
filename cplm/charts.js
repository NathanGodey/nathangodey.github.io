/* Native charts for the CPLM project page.
   Encoding everywhere: CPLM = green (--cp), vanilla = grey (--vanilla).
   Depends on d3 (global) and the #tip tooltip element. */
(() => {
  const BB = [["full", "Full"], ["hybrid", "Hybrid 3:1"], ["sw", "SW-256"]];
  const BB_LABEL = Object.fromEntries(BB);
  const tip = document.getElementById("tip");
  const C = { cplm: "var(--cp)", vanilla: "var(--vanilla)" };

  // ---------------------------------------------------------------- utils
  const fmtNum = (v, d = 2) => (v == null || isNaN(v) ? "–" : (+v).toFixed(d));
  function showTip(html, x, y) {
    tip.innerHTML = html;
    tip.classList.add("show");
    const tw = tip.offsetWidth, th = tip.offsetHeight;
    let left = Math.max(8, Math.min(window.innerWidth - tw - 8, x + 14));
    let top = y + 14;
    if (top + th > window.innerHeight - 8) top = y - th - 14;
    tip.style.left = left + "px"; tip.style.top = top + "px";
  }
  const hideTip = () => tip.classList.remove("show");
  const swatch = (color, dash) =>
    `<span class="swatch-line" style="border-top:2px ${dash ? "dashed" : "solid"} ${color}"></span>`;

  // re-render on width change
  function responsive(el, draw) {
    let w = 0;
    const ro = new ResizeObserver(() => {
      const nw = Math.round(el.clientWidth);
      if (nw && nw !== w) { w = nw; draw(nw); }
    });
    ro.observe(el);
    return () => draw(el.clientWidth);
  }

  // segmented control
  function seg(el, items, current, onPick) {
    el.innerHTML = "";
    el.classList.add("seg");
    items.forEach(([key, label]) => {
      const b = document.createElement("button");
      b.type = "button"; b.textContent = label;
      b.setAttribute("aria-pressed", String(key === current));
      b.addEventListener("click", () => {
        el.querySelectorAll("button").forEach((x) => x.setAttribute("aria-pressed", "false"));
        b.setAttribute("aria-pressed", "true");
        onPick(key);
      });
      el.appendChild(b);
    });
  }

  // ---------------------------------------------------------------- line chart
  /* opts: {series:[{name, color, dash, width, pts:[[x,y]...], band?:[[x,lo,hi]...], label?}],
            x:{label, log, domain, ticks, fmt}, y:{label, log, domain, ticks, fmt},
            height, shade:{x0, x1, label}, vline:{x, label}, title, tipFmt } */
  function lineChart(el, opts) {
    return responsive(el, (W) => {
      el.innerHTML = "";
      const H = opts.height || 240;
      const m = { t: opts.title ? 28 : 12, r: opts.labelRight === false ? 14 : 84, b: 40, l: 48 };
      if (W < 420) m.r = opts.labelRight === false ? 10 : 64;
      const iw = W - m.l - m.r, ih = H - m.t - m.b;
      const all = opts.series.flatMap((s) => s.pts);
      const xs = (opts.x.log ? d3.scaleLog() : d3.scaleLinear())
        .domain(opts.x.domain || d3.extent(all, (d) => d[0])).range([0, iw]);
      const yExt = opts.y.domain || d3.extent(all.concat(opts.series.flatMap((s) => (s.band || []).flatMap((b) => [[b[0], b[1]], [b[0], b[2]]]))), (d) => d[1]);
      const ys = (opts.y.log ? d3.scaleLog() : d3.scaleLinear()).domain(yExt).range([ih, 0]);
      if (!opts.y.domain && !opts.y.log) ys.nice(4);

      const svg = d3.select(el).append("svg").attr("width", W).attr("height", H).attr("class", "chart");
      if (opts.title) svg.append("text").attr("class", "c-title").attr("x", m.l).attr("y", 16).text(opts.title);
      const g = svg.append("g").attr("transform", `translate(${m.l},${m.t})`);

      if (opts.shade) {
        const x0 = xs(Math.max(opts.shade.x0, xs.domain()[0])), x1 = xs(Math.min(opts.shade.x1 ?? xs.domain()[1], xs.domain()[1]));
        g.append("rect").attr("class", "c-shade").attr("x", x0).attr("y", 0).attr("width", Math.max(0, x1 - x0)).attr("height", ih);
        if (opts.shade.label) g.append("text").attr("class", "c-note").attr("x", x0 + 6).attr("y", 12).text(opts.shade.label);
      }
      // grid + axes
      const yt = opts.y.ticks || 4;
      g.append("g").attr("class", "c-grid")
        .call(d3.axisLeft(ys).ticks(yt, opts.y.tickFmt).tickSize(-iw).tickFormat(""))
        .call((a) => a.select(".domain").remove());
      g.append("g").attr("class", "c-axis").call(d3.axisLeft(ys).ticks(yt, opts.y.tickFmt).tickSize(0).tickPadding(8))
        .call((a) => a.select(".domain").remove());
      const xa = d3.axisBottom(xs).tickSize(4).tickPadding(6);
      if (opts.x.tickValues) xa.tickValues(opts.x.tickValues);
      else xa.ticks(W < 420 ? 4 : (opts.x.ticks || 6), opts.x.tickFmt);
      if (opts.x.fmt) xa.tickFormat(opts.x.fmt);
      g.append("g").attr("class", "c-axis c-xaxis").attr("transform", `translate(0,${ih})`).call(xa);
      if (opts.x.label) g.append("text").attr("class", "c-label").attr("x", iw / 2).attr("y", ih + 34).attr("text-anchor", "middle").text(opts.x.label);
      if (opts.y.label) g.append("text").attr("class", "c-label").attr("transform", `translate(${-38},${ih / 2}) rotate(-90)`).attr("text-anchor", "middle").text(opts.y.label);

      // series
      const line = d3.line().defined((d) => d[1] != null && isFinite(d[1])).x((d) => xs(d[0])).y((d) => ys(d[1])).curve(d3.curveMonotoneX);
      const clipId = "clip" + Math.random().toString(36).slice(2);
      g.append("clipPath").attr("id", clipId).append("rect").attr("width", iw).attr("height", ih + 1).attr("y", -1);
      const plot = g.append("g").attr("clip-path", `url(#${clipId})`);
      for (const s of opts.series) {
        if (s.band) {
          plot.append("path").attr("class", "c-band")
            .attr("d", d3.area().x((d) => xs(d[0])).y0((d) => ys(d[1])).y1((d) => ys(d[2])).curve(d3.curveMonotoneX)(s.band))
            .style("fill", s.color);
        }
        plot.append("path").attr("class", "c-line").attr("d", line(s.pts))
          .style("stroke", s.color).style("stroke-width", s.width || 2)
          .style("stroke-dasharray", s.dash ? "5 4" : null);
        if (s.markers) plot.selectAll(null).data(s.pts).join("circle").attr("class", "c-dot")
          .attr("cx", (d) => xs(d[0])).attr("cy", (d) => ys(d[1])).attr("r", 3.5).style("fill", s.color);
      }
      // direct labels at the right end, de-overlapped
      if (opts.labelRight !== false) {
        const labs = opts.series.filter((s) => s.label !== false).map((s) => {
          const last = [...s.pts].reverse().find((d) => d[1] != null && isFinite(d[1]));
          return { s, y: ys(last[1]), x: xs(last[0]) };
        }).sort((a, b) => a.y - b.y);
        for (let i = 1; i < labs.length; i++) if (labs[i].y - labs[i - 1].y < 13) labs[i].y = labs[i - 1].y + 13;
        labs.forEach((l) => g.append("text").attr("class", "c-dlabel").attr("x", Math.min(l.x, iw) + 6).attr("y", l.y + 4)
          .style("fill", "var(--ink-2)").text(l.s.name));
      }
      // hover: crosshair + tooltip at nearest x
      const xsAll = Array.from(new Set(all.map((d) => d[0]))).sort((a, b) => a - b);
      const cross = g.append("line").attr("class", "c-cross").attr("y1", 0).attr("y2", ih).style("opacity", 0);
      const dots = g.append("g");
      g.append("rect").attr("width", iw).attr("height", ih).style("fill", "transparent")
        .on("pointermove", (ev) => {
          const [mx] = d3.pointer(ev);
          const xv = xs.invert(mx);
          const i = d3.bisectCenter(xsAll, xv);
          const X = xsAll[Math.max(0, Math.min(xsAll.length - 1, i))];
          cross.attr("x1", xs(X)).attr("x2", xs(X)).style("opacity", 1);
          dots.selectAll("*").remove();
          const rows = opts.series.map((s) => {
            const p = s.pts.reduce((best, d) => (Math.abs(d[0] - X) < Math.abs(best[0] - X) ? d : best), s.pts[0]);
            if (p[1] == null || !isFinite(p[1])) return "";
            dots.append("circle").attr("class", "c-hdot").attr("cx", xs(p[0])).attr("cy", ys(p[1])).attr("r", 4).style("fill", s.color);
            return `<div class="row"><span>${swatch(s.color, s.dash)}${s.name}</span><span>${(opts.y.tipFmt || fmtNum)(p[1])}</span></div>`;
          }).join("");
          showTip(`<div class="tt-head">${opts.x.tipLabel || opts.x.label || ""} ${(opts.x.tipFmt || ((v) => v))(X)}</div><hr>${rows}`, ev.clientX, ev.clientY);
        })
        .on("pointerleave", () => { cross.style("opacity", 0); dots.selectAll("*").remove(); hideTip(); });
    });
  }

  // ---------------------------------------------------------------- gain bars (HTML)
  /* rows: [{label, sub?, v:{full:[van, cplm], ...}, lower?}], unit, digits */
  function gainBars(el, { rows, unit = "pts", digits = 1, note, best }) {
    el.innerHTML = "";
    el.classList.add("gain");
    const deltas = rows.flatMap((r) => BB.map(([k]) => (r.lower ? -1 : 1) * (r.v[k][1] - r.v[k][0])));
    const max = Math.max(...deltas.map(Math.abs)) * 1.05;
    const head = document.createElement("div");
    head.className = "gain-row gain-head";
    head.innerHTML = `<div></div>` + BB.map(([, l]) => `<div class="gain-col">${l}</div>`).join("");
    el.appendChild(head);
    for (const r of rows) {
      const row = document.createElement("div");
      row.className = "gain-row" + (r.avg ? " avg" : "");
      row.innerHTML = `<div class="gain-label">${r.label}${r.sub ? `<span>${r.sub}</span>` : ""}</div>`;
      for (const [k, bl] of BB) {
        const [a, b] = r.v[k];
        const d = (r.lower ? -1 : 1) * (b - a);
        const cell = document.createElement("div");
        cell.className = "gain-cell" + (best && best.r === r && best.k === k ? " star" : "");
        const w = (Math.abs(d) / max) * 32;   // leave room for the value label
        cell.innerHTML = `<div class="gain-zero"></div><div class="gain-bar ${d >= 0 ? "pos" : "neg"}" style="${d >= 0 ? `left:50%` : `right:50%`};width:${w}%"></div>` +
          `<span class="gain-val ${d >= 0 ? "pos" : "neg"}" style="${d >= 0 ? `left:calc(50% + ${w}% + 4px)` : `right:calc(50% + ${w}% + 4px)`}">${d >= 0 ? "+" : "−"}${Math.abs(d).toFixed(digits)}</span>`;
        cell.addEventListener("pointermove", (ev) => showTip(
          `<div class="tt-head">${r.label} · ${bl}</div><hr>` +
          `<div class="row"><span>${swatch(C.vanilla)}Vanilla</span><span>${a.toFixed(digits)}</span></div>` +
          `<div class="row"><span>${swatch(C.cplm)}CPLM</span><span><b>${b.toFixed(digits)}</b></span></div>` +
          (r.lower ? `<div class="tt-note">lower is better</div>` : ""), ev.clientX, ev.clientY));
        cell.addEventListener("pointerleave", hideTip);
        row.appendChild(cell);
      }
      el.appendChild(row);
    }
    if (note) { const n = document.createElement("div"); n.className = "gain-note"; n.textContent = note; el.appendChild(n); }
  }

  // table view for the same rows
  function rowsTable(rows, digits) {
    const f = (v) => v.toFixed(digits);
    let h = `<table><thead><tr><th></th>${BB.map(([, l]) => `<th colspan="2">${l}</th>`).join("")}</tr>` +
      `<tr><th></th>${BB.map(() => `<th>Vanilla</th><th>CPLM</th>`).join("")}</tr></thead><tbody>`;
    for (const r of rows) {
      h += `<tr${r.avg ? ' class="avg"' : ""}><td>${r.label}${r.lower ? " ↓" : ""}</td>` + BB.map(([k]) => {
        const [a, b] = r.v[k]; const better = r.lower ? b < a : b > a;
        return `<td>${better ? f(a) : `<b>${f(a)}</b>`}</td><td>${better ? `<b>${f(b)}</b>` : f(b)}</td>`;
      }).join("") + `</tr>`;
    }
    return h + "</tbody></table>";
  }

  // ---------------------------------------------------------------- heatmap
  /* {rows:[labels], cols:[labels], z:[[...]], title, max, fmt, rowTitle, colTitle} */
  function heatmap(el, o) {
    return responsive(el, (W) => {
      el.innerHTML = "";
      const showVals = o.showVals !== false && W > 230;
      const m = { t: o.title ? 24 : 6, r: 4, b: o.colTitle ? 34 : 20, l: o.rowLabels === false ? 6 : 40 };
      const iw = W - m.l - m.r;
      const cw = iw / o.cols.length, chh = Math.min(o.cellH || 22, cw * 0.9);
      const ih = chh * o.rows.length, H = m.t + ih + m.b;
      const svg = d3.select(el).append("svg").attr("width", W).attr("height", H).attr("class", "chart");
      if (o.title) svg.append("text").attr("class", "c-title").attr("x", m.l).attr("y", 15).text(o.title);
      const g = svg.append("g").attr("transform", `translate(${m.l},${m.t})`);
      const col = (v) => `color-mix(in oklab, var(--cp) ${Math.round(Math.pow(Math.max(0, Math.min(1, v / (o.max || 100))), o.gamma || 1) * 100)}%, var(--heat-0))`;
      o.z.forEach((r, i) => r.forEach((v, j) => {
        const cell = g.append("g").attr("transform", `translate(${j * cw},${i * chh})`);
        cell.append("rect").attr("width", cw - 1.5).attr("height", chh - 1.5).attr("rx", 3).style("fill", v == null ? "var(--surface-2)" : col(v));
        if (showVals && v != null) cell.append("text").attr("class", "c-cell").attr("x", (cw - 1.5) / 2).attr("y", chh / 2 + 3.5)
          .attr("text-anchor", "middle").style("fill", v / (o.max || 100) > 0.55 ? "var(--on-cp)" : "var(--ink-2)").text((o.fmt || ((x) => Math.round(x)))(v));
        cell.on("pointermove", (ev) => showTip(`<div class="tt-head">${o.tipTitle || o.title || ""}</div><hr>` +
          `<div class="row"><span>${o.rowTitle || ""} ${o.rows[i]}</span><span></span></div>` +
          `<div class="row"><span>${o.colTitle || ""} ${o.cols[j]}</span><span><b>${v == null ? "–" : (o.tipFmt || ((x) => x.toFixed(1)))(v)}</b></span></div>`, ev.clientX, ev.clientY))
          .on("pointerleave", hideTip);
      }));
      if (o.rowLabels !== false) (o.rowTicks || o.rows).forEach((r, i) => g.append("text").attr("class", "c-tick").attr("x", -6).attr("y", i * chh + chh / 2 + 3.5).attr("text-anchor", "end").text(r));
      const every = Math.ceil(o.cols.length / Math.max(1, Math.floor(iw / 34)));
      o.cols.forEach((c, j) => { if (j % every === 0) g.append("text").attr("class", "c-tick").attr("x", j * cw + cw / 2).attr("y", ih + 13).attr("text-anchor", "middle").text(c); });
      if (o.colTitle) g.append("text").attr("class", "c-label").attr("x", iw / 2).attr("y", ih + 30).attr("text-anchor", "middle").text(o.colTitle);
    });
  }

  // ---------------------------------------------------------------- arrow scatter (vanilla -> CPLM)
  /* {pts:[{label, vanilla:[x,y], cplm:[x,y]}], x:{label}, y:{label}} */
  function arrowScatter(el, o) {
    return responsive(el, (W) => {
      el.innerHTML = "";
      const H = o.height || 260, m = { t: 14, r: 20, b: 42, l: 48 };
      const iw = W - m.l - m.r, ih = H - m.t - m.b;
      const all = o.pts.flatMap((p) => [p.vanilla, p.cplm]);
      const xs = d3.scaleLinear().domain(o.x.domain || [0, d3.max(all, (d) => d[0]) * 1.12]).range([0, iw]).nice();
      const ys = d3.scaleLinear().domain(o.y.domain || d3.extent(all, (d) => d[1])).range([ih, 0]).nice(4);
      const svg = d3.select(el).append("svg").attr("width", W).attr("height", H).attr("class", "chart");
      const g = svg.append("g").attr("transform", `translate(${m.l},${m.t})`);
      g.append("g").attr("class", "c-grid").call(d3.axisLeft(ys).ticks(4).tickSize(-iw).tickFormat("")).call((a) => a.select(".domain").remove());
      g.append("g").attr("class", "c-axis").call(d3.axisLeft(ys).ticks(4).tickSize(0).tickPadding(8)).call((a) => a.select(".domain").remove());
      g.append("g").attr("class", "c-axis c-xaxis").attr("transform", `translate(0,${ih})`).call(d3.axisBottom(xs).ticks(5).tickSize(4));
      g.append("text").attr("class", "c-label").attr("x", iw / 2).attr("y", ih + 36).attr("text-anchor", "middle").text(o.x.label);
      g.append("text").attr("class", "c-label").attr("transform", `translate(-38,${ih / 2}) rotate(-90)`).attr("text-anchor", "middle").text(o.y.label);
      if (o.hline) {
        g.append("line").attr("class", "c-ref").attr("x1", 0).attr("x2", iw).attr("y1", ys(o.hline.y)).attr("y2", ys(o.hline.y));
        g.append("text").attr("class", "c-note").attr("x", iw - 4).attr("y", ys(o.hline.y) - 6).attr("text-anchor", "end").text(o.hline.label);
      }
      const defs = svg.append("defs");
      const mid = "ah" + Math.random().toString(36).slice(2);
      defs.append("marker").attr("id", mid).attr("viewBox", "0 0 10 10").attr("refX", 8).attr("refY", 5).attr("markerWidth", 7).attr("markerHeight", 7).attr("orient", "auto")
        .append("path").attr("d", "M0,1 L9,5 L0,9 z").style("fill", "var(--cp)");
      for (const p of o.pts) {
        const [x0, y0] = [xs(p.vanilla[0]), ys(p.vanilla[1])], [x1, y1] = [xs(p.cplm[0]), ys(p.cplm[1])];
        const len = Math.hypot(x1 - x0, y1 - y0), sh = 8 / Math.max(len, 1);
        g.append("path").attr("class", "c-arrow").attr("marker-end", `url(#${mid})`)
          .attr("d", `M${x0 + (x1 - x0) * sh},${y0 + (y1 - y0) * sh} L${x1 - (x1 - x0) * sh},${y1 - (y1 - y0) * sh}`);
        for (const [arm, xy] of [["vanilla", [x0, y0]], ["cplm", [x1, y1]]]) {
          g.append("circle").attr("class", "c-dot big").attr("cx", xy[0]).attr("cy", xy[1]).attr("r", 6).style("fill", C[arm])
            .on("pointermove", (ev) => showTip(`<div class="tt-head">${p.label} · ${arm === "cplm" ? "CPLM" : "Vanilla"}</div><hr>` +
              `<div class="row"><span>${o.x.tip || o.x.label}</span><span>${fmtNum(p[arm][0], 1)}</span></div>` +
              `<div class="row"><span>${o.y.tip || o.y.label}</span><span><b>${fmtNum(p[arm][1], 2)}</b></span></div>`, ev.clientX, ev.clientY))
            .on("pointerleave", hideTip);
        }
        g.append("text").attr("class", "c-dlabel").attr("x", Math.max(x0, x1) + 10).attr("y", (y0 + y1) / 2 + 4).style("fill", "var(--ink-2)").text(p.label);
      }
    });
  }

  // ---------------------------------------------------------------- figure wiring
  const figs = {};
  const curve = (pts) => (pts || []).filter((d) => d && d[1] != null);

  figs.train = (el, D) => {
    const ctl = el.querySelector(".fig-ctl"), body = el.querySelector(".fig-body");
    const draw = (scale) => {
      body.innerHTML = "";
      const data = D.train_curves[scale];
      const xl = data._paper_xlim || d3.extent(BB.flatMap(([k]) => data[k].cplm), (d) => d[0]);
      const inX = (pts) => curve(pts).filter((d) => d[0] >= xl[0] && d[0] <= xl[1]);
      const all = BB.flatMap(([k]) => (data[k] ? [...inX(data[k].vanilla), ...inX(data[k].cplm)] : []));
      const yd = data._paper_ylim || d3.extent(all, (d) => d[1]);
      for (const [k, l] of BB) {
        if (!data[k]) continue;
        const c = document.createElement("div"); c.className = "panel"; body.appendChild(c);
        lineChart(c, {
          title: l, height: 230, labelRight: false,
          x: { label: "Training tokens (B)", domain: xl, tipLabel: "Tokens (B):", tipFmt: (v) => (+v).toFixed(1) },
          y: { label: k === "full" ? "Validation loss" : "", domain: yd, tipFmt: (v) => v.toFixed(3) },
          series: [
            { name: "Vanilla", color: C.vanilla, pts: inX(data[k].vanilla) },
            { name: "CPLM", color: C.cplm, pts: inX(data[k].cplm), width: 2.25 },
          ],
        });
      }
    };
    const SCALES = [["1p7B", "1.7B · 200B tokens"], ["360M", "360M · 20B tokens"], ["135M", "135M · 20B tokens"]];
    seg(ctl, SCALES.filter(([k]) => D.train_curves[k]), "1p7B", draw);
    draw("1p7B");
  };

  figs.memory = (el, D) => {
    const pts = BB.filter(([k]) => D.mem_vs_ppl_1p7B[k]).map(([k, l]) => ({
      label: l, vanilla: [D.mem_vs_ppl_1p7B[k].vanilla.kv_kb_per_token, D.mem_vs_ppl_1p7B[k].vanilla.ppl],
      cplm: [D.mem_vs_ppl_1p7B[k].cplm.kv_kb_per_token, D.mem_vs_ppl_1p7B[k].cplm.ppl],
    }));
    const full = D.mem_vs_ppl_1p7B.full;
    arrowScatter(el.querySelector(".fig-body"), {
      pts, height: 280,
      x: { label: "Cache memory per token at 4k context (KB)", tip: "KB / token" },
      y: { label: "FinePDFs perplexity", tip: "Perplexity" },
      hline: full ? { y: full.vanilla.ppl, label: "Full-attention vanilla LM" } : null,
    });
  };

  figs.window = (el, D) => {
    const ctl = el.querySelector(".fig-ctl"), body = el.querySelector(".fig-body");
    const NAMES = { fwedu: "FineWeb-Edu", finepdf: "FinePDFs", arxiv: "arXiv" };
    const draw = (ds) => {
      body.innerHTML = "";
      const d = D.window_sweep_135M[ds];
      for (const k of ["sw", "hybrid"]) {
        if (!d[k]) continue;
        const c = document.createElement("div"); c.className = "panel"; body.appendChild(c);
        const series = [
          { name: "Vanilla", color: C.vanilla, markers: true, pts: d[k].vanilla.map((r) => [r[1], r[2]]).sort((p, q) => p[0] - q[0]) },
          { name: "CPLM", color: C.cplm, markers: true, width: 2.25, pts: d[k].cplm.map((r) => [r[1], r[2]]).sort((p, q) => p[0] - q[0]) },
        ];
        if (d.full) {
          series.push({ name: "Full, vanilla", color: C.vanilla, markers: true, label: false, pts: d.full.vanilla.map((r) => [r[1], r[2]]) });
          series.push({ name: "Full, CPLM", color: C.cplm, markers: true, label: false, pts: d.full.cplm.map((r) => [r[1], r[2]]) });
        }
        const allY = series.flatMap((s) => s.pts.map((p) => p[1]));
        lineChart(c, {
          title: k === "sw" ? "Sliding window, w = 32 … 1024" : "Hybrid 3:1, w = 32 … 1024", height: 240,
          x: { label: "Cache memory at 2k tokens (MB)", domain: [0, 50], tipLabel: "Memory (MB):", tipFmt: (v) => (+v).toFixed(1) },
          y: { label: k === "sw" ? "Perplexity" : "", domain: [Math.min(...allY) * 0.97, Math.max(...allY) * 1.02] },
          series,
        });
      }
    };
    const keys = ["finepdf", "fwedu", "arxiv"].filter((k) => D.window_sweep_135M[k]);
    seg(ctl, keys.map((k) => [k, NAMES[k] || k]), keys.includes("finepdf") ? "finepdf" : keys[0], draw);
    draw(keys.includes("finepdf") ? "finepdf" : keys[0]);
  };

  figs.rolling = (el, D) => {
    const ctl = el.querySelector(".fig-ctl"), body = el.querySelector(".fig-body");
    const R = D.rolling16k;
    const draw = (k) => {
      body.innerHTML = "";
      const r = R[k];
      const shade = { x0: 4096, label: "beyond training length" };
      const xo = { label: "Position in document", tipLabel: "Position", fmt: (v) => (v >= 1000 ? v / 1000 + "k" : v), tipFmt: (v) => Math.round(v).toLocaleString() };
      const mk = (title, key, ylab, dom, withVan) => {
        const c = document.createElement("div"); c.className = "panel"; body.appendChild(c);
        const series = [];
        if (withVan && r.vanilla && r.vanilla[key]) series.push({ name: "Vanilla", color: C.vanilla, pts: r.vanilla.pos.map((p, i) => [p, r.vanilla[key][i]]),
          label: r.vanilla[key].at(-1) == null ? false : undefined });
        if (r.cplm && r.cplm[key]) series.push({ name: "CPLM", color: C.cplm, width: 2.25, pts: r.cplm.pos.map((p, i) => [p, r.cplm[key][i]]) });
        lineChart(c, { title, height: 220, shade, x: xo, y: { label: ylab, domain: dom }, series, labelRight: withVan });
      };
      mk("Perplexity", "ppl", "Perplexity", [5, 15], true);
      mk("<copy> gate", "copy", "Probability", [0, 1], false);
      mk("Sink", "sink", "Probability", [0, 1], false);
    };
    seg(ctl, BB.filter(([k]) => R[k]), "full", draw);
    draw("full");
  };

  figs.niah = (el, D) => {
    const body = el.querySelector(".fig-body");
    const N = D.niah;
    const fmtLen = (v) => (typeof v === "number" ? (v >= 1024 ? Math.round(v / 1024) + "k" : v) : v);
    const depthLab = N.depths.map((d) => (typeof d === "number" && d <= 1 ? Math.round(d * 100) + "%" : d));
    for (const [k, l] of BB) {
      if (!N[k]) continue;
      const col = document.createElement("div"); col.className = "niah-col"; body.appendChild(col);
      col.innerHTML = `<div class="niah-head">${l}</div>`;
      for (const arm of ["vanilla", "cplm"]) {
        const z = N[k][arm];
        const avg = d3.mean(z.flat());
        const c = document.createElement("div"); c.className = "panel tight"; col.appendChild(c);
        heatmap(c, {
          title: `${arm === "cplm" ? "CPLM" : "Vanilla"} · avg ${avg.toFixed(1)}`, tipTitle: `${l} · ${arm === "cplm" ? "CPLM" : "Vanilla"}`,
          rows: depthLab, cols: N.lengths.map(fmtLen), z, rowTitle: "Depth", colTitle: arm === "cplm" ? "Context length" : null,
          rowLabels: k === "full", cellH: 20,
        });
      }
    }
  };

  figs.hotpot = (el, D) => {
    const body = el.querySelector(".fig-body"), ctl = el.querySelector(".fig-ctl");
    const Hd = D.hotpot;
    const draw = (k) => {
      body.innerHTML = "";
      for (const [reg, title] of [["docs_visible", "Documents in the KV cache"], ["docs_dropped", "Documents reachable only through the CP head"]]) {
        const r = Hd[reg] && Hd[reg][k]; if (!r) continue;
        const c = document.createElement("div"); c.className = "panel"; body.appendChild(c);
        const series = [];
        for (const [key, v] of Object.entries(r)) {
          if (!Array.isArray(v)) continue;
          const isC = key === "cplm";
          series.push({ name: isC ? "CPLM" : key === "vanilla" ? "Vanilla" : "Vanilla, last-layer KV",
            color: isC ? C.cplm : C.vanilla, dash: key === "vanilla_lastlayer", width: isC ? 2.25 : 2, markers: true,
            pts: Hd.distractors.map((x, i) => [x, v[i]]) });
        }
        lineChart(c, { title, height: 230, x: { label: "Distractor documents", log: true, tickValues: Hd.distractors.filter((d, i) => i % 2 === 0 || d === Hd.distractors.at(-1)), fmt: (v) => v, tipLabel: "Distractors:" },
          y: { label: reg === "docs_visible" ? "Exact match (%)" : "", domain: [0, 60] }, series });
      }
    };
    seg(ctl, BB.filter(([k]) => (Hd.docs_visible || {})[k] || (Hd.docs_dropped || {})[k]), "full", draw);
    draw("full");
  };

  figs.bottleneck = (el, D) => {
    const body = el.querySelector(".fig-body");
    if (D.nullspace) {
      const n = D.nullspace, c = document.createElement("div"); c.className = "panel"; body.appendChild(c);
      const mkS = (key, name, color, dash, band) => {
        if (!n[key]) return null;
        const pos = n[key].pos || n.pos;
        return { name, color, dash, width: key === "cp_query" ? 2.25 : 2, markers: key !== "lm_head",
          pts: pos.map((p, i) => [p, n[key].mean[i]]),
          band: band && n[key].lo ? pos.map((p, i) => [p, n[key].lo[i], n[key].hi[i]]) : null };
      };
      lineChart(c, {
        title: "Gradient norm lost on the way back", height: 240,
        x: { label: "Sequence position", tipLabel: "Position" },
        y: { label: "Gradient norm lost (%)", domain: [0, 100], tipFmt: (v) => v.toFixed(1) + "%" },
        series: [mkS("lm_head", "LM head", C.vanilla, false), mkS("random", "Random matrix", "var(--muted)", true),
          mkS("cp_key", "CP keys", "color-mix(in oklab, var(--cp) 55%, var(--surface))", false, true), mkS("cp_query", "CP query", C.cplm, false, true)].filter(Boolean),
      });
    }
    if (D.spamlang) {
      const s = D.spamlang, c = document.createElement("div"); c.className = "panel"; body.appendChild(c);
      lineChart(c, {
        title: "SpamLang: repeat one symbol", height: 240,
        x: { label: "Vocabulary size", log: true, tickValues: s.vocab, fmt: (v) => (v >= 1000 ? Math.round(v / 1000) + "k" : v), tipLabel: "Vocabulary" },
        y: { label: "Top-1 accuracy (%)", domain: [0, 105], tipFmt: (v) => v.toFixed(1) + "%" },
        series: [{ name: "Vanilla", color: C.vanilla, markers: true, pts: s.vocab.map((v, i) => [v, 100 * s.vanilla.acc[i] * (s.vanilla.acc[i] <= 1 ? 1 : 0.01)]) },
          { name: "CPLM", color: C.cplm, markers: true, width: 2.25, pts: s.vocab.map((v, i) => [v, 100 * s.cplm.acc[i] * (s.cplm.acc[i] <= 1 ? 1 : 0.01)]) }],
      });
    }
  };

  figs.induction = (el, D) => {
    const body = el.querySelector(".fig-body"), ctl = el.querySelector(".fig-ctl");
    const I = D.induction;
    const draw = (k) => {
      body.innerHTML = "";
      for (const [key, title, ylab] of [["nll", "Copying a repeated random sequence", "NLL on repeated half"], ["heads", "Induction heads in the backbone", "# heads (score > 0.3)"]]) {
        if (!I[key] || !I[key][k]) continue;
        const c = document.createElement("div"); c.className = "panel"; body.appendChild(c);
        lineChart(c, { title, height: 230, x: { label: "Sequence length", log: true, tickValues: I.seq_len, fmt: (v) => v, tipLabel: "T =" },
          y: { label: ylab, domain: key === "heads" ? [0, d3.max([...I[key][k].vanilla, ...I[key][k].cplm]) * 1.1] : null },
          series: [{ name: "Vanilla", color: C.vanilla, markers: true, pts: I.seq_len.map((x, i) => [x, I[key][k].vanilla[i]]) },
            { name: "CPLM", color: C.cplm, width: 2.25, markers: true, pts: I.seq_len.map((x, i) => [x, I[key][k].cplm[i]]) }]
 });
      }
    };
    seg(ctl, BB.filter(([k]) => I.nll && I.nll[k]), "full", draw);
    draw("full");
    if (I.map_T128) {
      const maps = el.querySelector(".fig-maps");
      for (const arm of ["vanilla", "cplm"]) {
        const z = I.map_T128[arm]; if (!z) continue;
        const c = document.createElement("div"); c.className = "panel"; maps.appendChild(c);
        heatmap(c, { title: `Induction score per head · ${arm === "cplm" ? "CPLM" : "Vanilla"} (Full, T=128)`, tipTitle: arm === "cplm" ? "CPLM" : "Vanilla",
          rows: z.map((_, i) => i), rowTicks: z.map((_, i) => (i % 4 === 0 ? i : "")), cols: z[0].map((_, j) => j), z, max: (I.map_T128._clim || [0, 1])[1], gamma: 0.6, showVals: false, rowLabels: true, cellH: 7,
          rowTitle: "Layer", colTitle: "Head", tipFmt: (v) => v.toFixed(2) });
      }
    }
  };

  figs.passk = (el, D) => {
    const body = el.querySelector(".fig-body");
    const P = D.gsm8k_passk;
    for (const [k, l] of BB) {
      if (!P[k]) continue;
      const c = document.createElement("div"); c.className = "panel"; body.appendChild(c);
      lineChart(c, { title: l, height: 210, labelRight: false, x: { label: "k", log: true, tickValues: P.k, fmt: (v) => v, tipLabel: "k =" },
        y: { label: k === "full" ? "GSM8K pass@k (%)" : "" },
        series: [{ name: "Vanilla", color: C.vanilla, markers: true, pts: P.k.map((x, i) => [x, P[k].vanilla[i]]) },
          { name: "CPLM", color: C.cplm, width: 2.25, markers: true, pts: P.k.map((x, i) => [x, P[k].cplm[i]]) }] });
    }
  };

  // ---------------------------------------------------------------- schema: retrieval through the copy cache
  /* Three regimes side by side. Each panel draws the model bottom-up: tokens, layers 1..24 with
     their KV cache, then the copy keys on top; columns are documents | question & answer. */
  figs.hotpotSchema = (el, D) => {
    const H = D.hotpot, MEM = H.memory_mb_per_doc;
    const REG = [
      { key: "kv", title: "Documents in the KV cache", sub: "CPLM, standard setup", docKV: "all", docCP: true },
      { key: "copy", title: "Copy cache only", sub: "CPLM, documents encoded once", docKV: "none", docCP: true, star: true },
      { key: "last", title: "Last-layer KV only", sub: "vanilla control", docKV: "last", docCP: false },
    ];
    const st = { bb: "full", ni: 6 };
    const ctl = el.querySelector(".fig-ctl"), body = el.querySelector(".fig-body");
    ctl.innerHTML = `<div class="seg s-bb"></div>
      <label class="slider">Distractors <input type="range" min="0" max="${H.distractors.length - 1}" step="1" value="${st.ni}"><b class="s-n"></b></label>`;
    body.innerHTML = `<div class="hs-panels">${REG.map((r) => `<div class="hs-panel ${r.star ? "star" : ""}"><div class="hs-svg"></div><div class="hs-ro"></div></div>`).join("")}</div>`;
    seg(ctl.querySelector(".s-bb"), BB, st.bb, (b) => { st.bb = b; draw(); });
    ctl.querySelector("input").addEventListener("input", (e) => { st.ni = +e.target.value; draw(); });
    const fmtMB = (v) => (v >= 1000 ? (v / 1000).toFixed(1) + " GB" : v >= 10 ? Math.round(v) + " MB" : v.toFixed(1) + " MB");
    const LAYERS = [24, 23, null, 2, 1];   // top to bottom; null = ellipsis
    // red -> amber -> green by how good a number is overall (t = 1 is best)
    const goodness = (t) => {
      t = Math.max(0, Math.min(1, (t - 0.25) / 0.5));   // stretch the middle: clearly good reads green, clearly bad reads red
      return t >= 0.5 ? `color-mix(in oklch, var(--cp) ${Math.round((t - 0.5) * 200)}%, var(--mid-ink))`
                      : `color-mix(in oklch, var(--mid-ink) ${Math.round(t * 200)}%, var(--sink))`;
    };
    const allEM = ["docs_visible", "docs_dropped"].flatMap((reg) => BB.flatMap(([k]) => Object.values(H[reg][k] || {}).filter(Array.isArray).flat()));
    const emLo = Math.min(...allEM), emHi = Math.max(...allEM);
    const memLo = Math.log((H.distractors[0] + 2) * MEM.full.cplm_docs_dropped);
    const memHi = Math.log((H.distractors.at(-1) + 2) * MEM.full.cplm);

    function panel(box, r, n) {
      const W = box.clientWidth; if (!W) return;
      const labW = 58, gap = 40, docW = (W - labW - gap) * 0.56, qaW = W - labW - gap - docW;
      const xD = labW, xQ = labW + docW + gap;
      const yT = 6, yCP = 62, hRow = 24, yL0 = yCP + 46, step = 30, yTok = yL0 + step * 4 + 24 + 16, hTok = 38, Hh = yTok + hTok + 30;
      const sw = st.bb === "sw";
      let g = `<svg width="${W}" height="${Hh}" class="chart schema">
        <defs><pattern id="hs-hatch-${r.key}" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="6" style="stroke:var(--hair);stroke-width:3"/></pattern>
        <marker id="hs-g-${r.key}" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0,1 L9,5 L0,9 z" style="fill:var(--cp)"/></marker>
        <marker id="hs-k-${r.key}" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0,1 L9,5 L0,9 z" style="fill:var(--ink)"/></marker></defs>`;
      g += `<text x="0" y="${yT + 16}" class="sc-qt">${r.title}</text><text x="0" y="${yT + 34}" class="sc-qs">${r.sub}</text>`;
      const hatch = `url(#hs-hatch-${r.key})`;
      const bar = (x, y, w, h, kind) => kind === "kv" ? `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="5" class="sc-cell kept kv"/>`
        : kind === "cp" ? `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="5" class="sc-cell kept cp"/>`
        : `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="5" class="sc-cell dropped" style="fill:${hatch}"/>`;
      const arrow = (y0, y1, cls, mk) => `<path d="M${xQ - 3},${y0} C${xQ - gap / 2},${y0} ${xD + docW + gap / 2},${y1} ${xD + docW + 5},${y1}" class="${cls}" marker-end="url(#${mk}-${r.key})"/>`;
      // copy keys (top)
      g += `<text x="${labW - 8}" y="${yCP + 16}" text-anchor="end" class="sc-ll cp">copy keys</text>`;
      g += bar(xD, yCP, docW, hRow, r.docCP ? "cp" : "none") + bar(xQ, yCP, qaW, hRow, r.docCP ? "cp" : "none");
      if (!r.docCP) g += `<text x="${xD + 8}" y="${yCP + 16}" class="sc-in">no copy head</text>`;
      if (r.docCP) g += arrow(yCP + hRow / 2, yCP + hRow / 2, "sc-copy", "hs-g");
      // layers 24 .. 1 (top to bottom on screen, so the stack reads bottom-up)
      LAYERS.forEach((L, i) => {
        const y = yL0 + i * step;
        if (L == null) { g += `<text x="${xD + docW / 2}" y="${y + 16}" text-anchor="middle" class="sc-dots">⋮</text><text x="${xQ + qaW / 2}" y="${y + 16}" text-anchor="middle" class="sc-dots">⋮</text>`; return; }
        g += `<text x="${labW - 8}" y="${y + 16}" text-anchor="end" class="sc-ll">layer ${L}</text>`;
        const keep = r.docKV === "all" ? !sw : r.docKV === "last" ? L === 24 : false;
        g += bar(xD, y, docW, hRow, keep ? "kv" : "none") + bar(xQ, y, qaW, hRow, "kv");
        if (keep) g += arrow(y + hRow / 2, y + hRow / 2, "sc-att", "hs-k");
      });
      // tokens (bottom)
      let xEnd = xD;
      for (let i = 0; i < 4; i++) {
        const x = xD + i * 26, gold = i === 1;
        if (x + 22 > xD + docW - 44) break;
        xEnd = x + 22;
        g += `<rect x="${x}" y="${yTok}" width="22" height="${hTok}" rx="4" class="sc-doc ${gold ? "gold" : ""}"/>`;
        for (let l = 0; l < 3; l++) g += `<line x1="${x + 5}" x2="${x + 17 - (l === 2 ? 5 : 0)}" y1="${yTok + 10 + l * 8}" y2="${yTok + 10 + l * 8}" class="sc-line${gold ? " on-gold" : ""}"/>`;
      }
      g += `<text x="${xEnd + 6}" y="${yTok + hTok / 2 + 5}" class="sc-more">×${n + 2}</text>`;
      g += `<rect x="${xQ}" y="${yTok}" width="${qaW}" height="${hTok}" rx="6" class="sc-ans"/><text x="${xQ + qaW / 2}" y="${yTok + hTok / 2 + 5}" text-anchor="middle" class="sc-qt">Q → A</text>`;
      g += `<text x="${labW - 8}" y="${yTok + hTok / 2 + 4}" text-anchor="end" class="sc-ll">tokens</text>`;
      g += `<text x="${xD}" y="${Hh - 8}" class="sc-col">Documents</text><text x="${xQ}" y="${Hh - 8}" class="sc-col">Question</text>`;
      g += `</svg>`;
      box.innerHTML = g;
    }

    function draw() {
      const n = H.distractors[st.ni], nDocs = n + 2, i = st.ni;
      ctl.querySelector(".s-n").textContent = n;
      const vis = H.docs_visible[st.bb], drop = H.docs_dropped[st.bb];
      const kvDoc = st.bb === "sw" ? 0 : MEM[st.bb].vanilla, cpDoc = MEM[st.bb].cplm_docs_dropped;
      const memFull = nDocs * MEM.full.vanilla;
      const panels = body.querySelectorAll(".hs-panel");
      REG.forEach((r, k) => {
        panel(panels[k].querySelector(".hs-svg"), r, n);
        const mem = nDocs * (r.docKV === "all" ? kvDoc + cpDoc : r.docKV === "last" ? 2 * cpDoc : cpDoc);
        const em = r.key === "kv" ? vis.cplm[i] : r.key === "copy" ? drop.cplm[i] : drop.vanilla_lastlayer[i];
        const vs = memFull / mem >= 1.5 ? `${Math.round(memFull / mem)}× less than Full vanilla` : "Full-size cache";
        const emC = goodness((em - emLo) / (emHi - emLo)), memC = goodness(1 - (Math.log(mem) - memLo) / (memHi - memLo));
        panels[k].querySelector(".hs-ro").innerHTML =
          `<div><span>Exact match</span><b style="color:${emC}">${em.toFixed(1)}%</b></div>` +
          `<div><span>Document cache</span><b style="color:${memC}">${fmtMB(mem)}</b><i>${vs}</i></div>`;
      });
    }
    new ResizeObserver(() => draw()).observe(body);
    draw();
  };

  // ---------------------------------------------------------------- schema: gradient flow through the two heads
  figs.gradSchema = (el, D) => {
    const N = D.nullspace;
    const st = { i: 0, path: "cp_query" };
    const ctl = el.querySelector(".fig-ctl"), body = el.querySelector(".fig-body");
    ctl.innerHTML = `<div class="seg s-path"></div><label class="slider">Position <input type="range" min="0" max="${N.pos.length - 1}" step="1" value="0"><b class="s-n"></b></label>`;
    body.innerHTML = `<div class="schema-svg"></div>`;
    const box = body.querySelector(".schema-svg");
    seg(ctl.querySelector(".s-path"), [["cp_query", "CP query path"], ["cp_key", "CP key path"]], st.path, (k) => { st.path = k; draw(); });
    ctl.querySelector("input").addEventListener("input", (e) => { st.i = +e.target.value; draw(); });

    function band(x0, x1, yc0, yc1, th0, th1) {   // ribbon from (x0, centre yc0, thickness th0) to (x1, yc1, th1)
      const xm = (x0 + x1) / 2;
      return `M${x0},${yc0 - th0 / 2} C${xm},${yc0 - th0 / 2} ${xm},${yc1 - th1 / 2} ${x1},${yc1 - th1 / 2}` +
        ` L${x1},${yc1 + th1 / 2} C${xm},${yc1 + th1 / 2} ${xm},${yc0 + th0 / 2} ${x0},${yc0 + th0 / 2} Z`;
    }
    function draw() {
      const W = box.clientWidth; if (!W) return;
      const pos = (N[st.path].pos || N.pos)[st.i];
      ctl.querySelector(".s-n").textContent = pos.toLocaleString();
      const narrow = W < 560, T = narrow ? 46 : 64;
      const Hh = narrow ? 380 : 360, xIn = narrow ? 0 : 130, xH0 = narrow ? W * 0.22 : W * 0.33, xH1 = xH0 + (narrow ? 48 : 76);
      const xBb = W - (narrow ? 58 : 118), drainX = Math.min(xH1 + (narrow ? 70 : 120), xBb - 40);
      const rows = [
        { name: "LM head", shape: "49,152 → 2,048", lost: N.lm_head.mean[0], y: narrow ? 118 : 112, dir: -1 },
        { name: "Copy-Paste head", shape: `${pos.toLocaleString()} → 2,048`, lost: N[st.path].mean[st.i], y: narrow ? 258 : 244, dir: 1 },
      ];
      const rnd = N.random.mean[st.i];
      let g = `<svg width="${W}" height="${Hh}" class="chart schema"><defs>
        <linearGradient id="gs-up" x1="0" x2="0" y1="1" y2="0"><stop offset="0" style="stop-color:var(--sink);stop-opacity:.6"/><stop offset="1" style="stop-color:var(--sink);stop-opacity:0"/></linearGradient>
        <linearGradient id="gs-down" x1="0" x2="0" y1="0" y2="1"><stop offset="0" style="stop-color:var(--sink);stop-opacity:.6"/><stop offset="1" style="stop-color:var(--sink);stop-opacity:0"/></linearGradient></defs>`;
      g += `<rect x="${xBb}" y="${rows[0].y - T / 2 - 14}" width="${W - xBb}" height="${rows[1].y - rows[0].y + T + 28}" rx="12" class="sc-bb"/>`;
      g += `<text x="${xBb + (W - xBb) / 2}" y="${(rows[0].y + rows[1].y) / 2 + 5}" text-anchor="middle" class="sc-bbt">Backbone</text>`;
      for (const r of rows) {
        const k = Math.max(1, T * (1 - r.lost / 100)), l = T - k;
        const top = r.y - T / 2, bot = r.y + T / 2;
        // lost share sits on the outer side of the ribbon, kept share on the inner side
        const lostC = r.dir < 0 ? top + l / 2 : bot - l / 2, keptC = r.dir < 0 ? bot - k / 2 : top + k / 2;
        if (narrow) g += `<text x="0" y="${r.dir < 0 ? top - 26 : bot + 44}" class="sc-qt">${r.name}</text>`;
        else g += `<text x="0" y="${r.y - 2}" class="sc-qt">${r.name}</text><text x="0" y="${r.y + 16}" class="sc-qs">gradient in</text>`;
        g += `<path d="${band(xIn, xH0, r.y, r.y, T, T)}" class="sc-flow"/>`;
        g += `<path d="${band(xH1, xBb, keptC, r.y, k, k)}" class="sc-flow"/>`;
        if (l > 0.5) {
          const ey = lostC + r.dir * (narrow ? 60 : 74);
          g += `<path d="M${xH1},${lostC} C${(xH1 + drainX) / 2},${lostC} ${drainX - 10},${lostC + r.dir * 10} ${drainX},${ey}" class="sc-drain" style="stroke-width:${l};stroke:url(#${r.dir < 0 ? "gs-up" : "gs-down"})"/>`;
          g += `<text x="${drainX + 10}" y="${ey + (r.dir < 0 ? 4 : 0)}" class="sc-lost">${r.lost.toFixed(1)}% lost</text>`;
        }
        g += `<rect x="${xH0}" y="${top - 8}" width="${xH1 - xH0}" height="${T + 16}" rx="8" class="sc-head"/>`;
        g += `<text x="${(xH0 + xH1) / 2}" y="${r.y + 5}" text-anchor="middle" class="sc-hl">${r.dir < 0 ? "W" : "K"}</text>`;
        g += `<text x="${(xH0 + xH1) / 2}" y="${r.dir < 0 ? bot + 24 : top - 16}" text-anchor="middle" class="sc-qs">${r.shape}</text>`;
        const lx = (drainX + xBb) / 2 + 10;
        g += `<text x="${lx}" y="${r.dir < 0 ? keptC + k / 2 + 22 : keptC - k / 2 - 10}" text-anchor="middle" class="sc-big">${(100 - r.lost).toFixed(1)}% kept</text>`;
      }
      g += `</svg><p class="schema-note">Measured on the 135M Full CPLM at position ${pos.toLocaleString()} of 2,048. A random matrix with the Copy-Paste head's shape would keep ${(100 - rnd).toFixed(0)}%.</p>`;
      box.innerHTML = g;
    }
    new ResizeObserver(draw).observe(box);
    draw();
  };

  // ---------------------------------------------------------------- standout downstream results
  // [vanilla, CPLM] per backbone, from the paper's tables
  const HIGHLIGHTS = [
    { tag: "Long context", bench: "RULER", unit: "points", v: { full: [33.6, 39.6], hybrid: [33.2, 37.8], sw: [7.9, 29.2] }, note: "synthetic retrieval, 4k–16k tokens" },
    { tag: "After SFT", bench: "MATH", unit: "points", v: { full: [13.9, 17.5], hybrid: [16.5, 17.4], sw: [7.2, 16.4] }, note: "competition math, chain of thought" },
    { tag: "Long context", bench: "LongBench few-shot", unit: "points", v: { full: [20.7, 28.3], hybrid: [20.5, 35.1], sw: [16.6, 30.3] }, note: "in-context examples at 16k tokens" },
    { tag: "Long context", bench: "LongBench code", unit: "points", v: { full: [15.4, 18.6], hybrid: [17.4, 25.6], sw: [14.8, 25.0] }, note: "code completion at 16k tokens" },
    { tag: "After SFT", bench: "GSM8K", unit: "points", v: { full: [28.9, 33.1], hybrid: [27.9, 30.4], sw: [18.6, 25.2] }, note: "grade-school math, chain of thought" },
    { tag: "Zero-shot", bench: "LAMBADA", unit: "points", v: { full: [44.46, 46.92], hybrid: [43.70, 46.92], sw: [42.46, 46.42] }, note: "the target word often appears earlier" },
  ];
  function highlights(el) {
    el.innerHTML = HIGHLIGHTS.map((h) => {
      const ds = BB.map(([k]) => h.v[k][1] - h.v[k][0]);
      const lo = Math.min(...ds), hi = Math.max(...ds);
      const f1 = (x) => x.toFixed(1);
      const big = `+${f1(lo)}–${f1(hi)}`;
      const max = Math.max(...BB.map(([k]) => h.v[k][1])) * 1.08;
      const rows = BB.map(([k, l]) => {
        const [a, b] = h.v[k];
        return `<div class="hl-row"><span>${l}</span><div class="hl-bar"><div class="hl-track"></div>
            <div class="hl-span" style="left:${(a / max) * 100}%;width:${((b - a) / max) * 100}%"></div>
            <div class="hl-dot v" style="left:${(a / max) * 100}%"></div><div class="hl-dot c" style="left:${(b / max) * 100}%"></div></div>
          <span class="hl-d">+${(b - a).toFixed(1)}</span><span class="hl-ab">${a} → ${b}</span></div>`;
      }).join("");
      return `<div class="hl-card">
        <div class="hl-top"><span class="hl-tag">${h.tag}</span><span class="hl-bb">1.7B</span></div>
        <div class="hl-big">${big}</div>
        <div class="hl-bench">${h.bench} <small>${h.unit}</small></div>
        <div class="hl-rows">${rows}</div>
        <div class="hl-note">${h.note}</div></div>`;
    }).join("");
  }
  document.querySelectorAll(".highlights").forEach(highlights);

  // ---------------------------------------------------------------- tables -> gain bars
  const T = {
    zeroshot: { digits: 2, rows: [
      ["HellaSwag", [61.12, 61.70], [61.08, 61.70], [61.00, 61.78]],
      ["LAMBADA", [44.46, 46.92], [43.70, 46.92], [42.46, 46.42]],
      ["PIQA", [75.24, 74.86], [74.48, 74.48], [74.48, 74.70]],
      ["SciQ", [88.20, 89.20], [87.80, 87.40], [87.00, 87.30]],
      ["ARC-e", [68.39, 68.10], [69.32, 66.46], [67.17, 67.59]],
      ["ARC-c", [40.96, 41.21], [40.96, 41.55], [41.30, 41.13]],
      ["WinoGrande", [58.80, 59.43], [58.17, 59.59], [58.01, 58.41]],
      ["Average", [62.45, 63.06], [62.22, 62.59], [61.63, 62.48], true]] },
    sft: { digits: 1, rows: [
      ["MATH", [13.9, 17.5], [16.5, 17.4], [7.2, 16.4]],
      ["GSM8K", [28.9, 33.1], [27.9, 30.4], [18.6, 25.2]],
      ["HumanEval", [20.4, 21.1], [19.8, 22.1], [15.4, 19.2]],
      ["MBPP", [16.9, 17.5], [19.0, 17.4], [16.1, 20.8]],
      ["IFEval", [41.2, 43.0], [38.3, 40.1], [37.2, 38.4]],
      ["Average", [24.2, 26.4], [24.3, 25.5], [18.9, 24.0], true]] },
    longctx: { digits: 1, rows: [
      ["BABILong", [26.4, 32.0], [27.7, 32.9], [13.8, 16.1], false, "0–16k"],
      ["RULER", [33.6, 39.6], [33.2, 37.8], [7.9, 29.2], false, "4–16k"],
      ["Single-doc QA", [5.7, 6.8], [4.6, 5.4], [3.0, 7.7], false, "LongBench"],
      ["Multi-doc QA", [6.1, 6.7], [5.3, 3.3], [2.9, 4.4], false, "LongBench"],
      ["Summarization", [11.8, 10.2], [8.4, 14.0], [6.4, 10.8], false, "LongBench"],
      ["Few-shot", [20.7, 28.3], [20.5, 35.1], [16.6, 30.3], false, "LongBench"],
      ["Synthetic", [1.7, 0.8], [0.7, 1.7], [1.4, 2.1], false, "LongBench"],
      ["Code", [15.4, 18.6], [17.4, 25.6], [14.8, 25.0], false, "LongBench"],
      ["LongBench avg.", [10.4, 12.2], [9.5, 14.3], [7.4, 13.4], true]] },
  };
  function tableRows(key) {
    return T[key].rows.map(([label, f, h, s, avg, sub]) => ({ label, sub, avg, v: { full: f, hybrid: h, sw: s } }));
  }
  function wireGain(el) {
    const key = el.dataset.table, rows = tableRows(key), digits = T[key].digits;
    const body = el.querySelector(".fig-body");
    // the most notable gain: largest CPLM - vanilla difference outside the average row
    let best = null;
    rows.forEach((r, ri) => { if (!r.avg) BB.forEach(([k], ci) => {
      const d = r.v[k][1] - r.v[k][0];
      if (!best || d > best.d) best = { ri, ci, d, r, k };
    }); });
    gainBars(body, { rows, digits, best });
    const note = el.querySelector(".gain-callout");
    if (note && best) note.innerHTML = `<b>Biggest jump:</b> ${best.r.label} with ${BB_LABEL[best.k]}, ` +
      `${best.r.v[best.k][0].toFixed(digits)} → ${best.r.v[best.k][1].toFixed(digits)} <span>(+${best.d.toFixed(digits)})</span>`;
    const tb = el.querySelector(".fig-table");
    if (tb) tb.innerHTML = rowsTable(rows, digits);
    const btn = el.querySelector(".view-toggle");
    if (btn) btn.addEventListener("click", () => {
      const on = el.classList.toggle("show-table");
      btn.textContent = on ? "Show chart" : "Show table";
    });
  }

  // ---------------------------------------------------------------- boot
  document.querySelectorAll(".fig[data-table]").forEach(wireGain);
  fetch("figdata.json").then((r) => (r.ok ? r.json() : null)).catch(() => null).then((D) => {
    document.querySelectorAll(".fig[data-fig]").forEach((el) => {
      const name = el.dataset.fig, need = el.dataset.needs.split(",");
      const ok = D && need.every((k) => D[k]);
      if (!ok) { el.classList.add("fallback"); return; }      // keep the paper's figure
      try { figs[name](el, D); el.classList.add("native"); }
      catch (e) { console.warn("figure", name, e); el.classList.add("fallback"); }
    });
  });
  window.addEventListener("scroll", hideTip, { passive: true });
})();
