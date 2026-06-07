/**
 * Sahm (إسهام) - Dashboard Controller Logic
 * Integrates real financial data from data.js, handles user interaction,
 * tab switching, and renders beautiful dark-themed Chart.js models.
 */

// State Management
let currentAsset = 'aapl'; // 'aapl' or 'gold'
let priceChartInstance = null;
let rsiChartInstance = null;
let macdChartInstance = null;

// Cairo Font definition for Chart.js
const CHART_FONT = {
  family: "'Cairo', sans-serif",
  size: 11
};

// Check if data is available
document.addEventListener("DOMContentLoaded", () => {
  if (!window.SahmData) {
    console.error("Error: SahmData is not loaded. Please make sure data.js is executed successfully.");
    alert("تنبيه: لم يتم تحميل ملف البيانات data.js بنجاح. تأكد من وجود الملف في نفس المجلد.");
    return;
  }
  
  // Initialize navigation sidebar click handlers
  initSidebarTabs();
  
  // Load initial view for Apple stock
  switchAsset('aapl');
  
  // Set the default tab to the project intro landing screen
  showTab('tab-intro');
});

/**
 * Initializes sidebar tab highlighting and scrolling
 */
function initSidebarTabs() {
  const navItems = document.querySelectorAll(".sidebar .nav-item");
  navItems.forEach(item => {
    item.addEventListener("click", () => {
      // Remove active from all items
      navItems.forEach(i => i.classList.remove("active"));
      // Add active to clicked item
      item.classList.add("active");
      
      const tabId = item.getAttribute("data-tab");
      
      // Update active panels and headers
      showTab(tabId);
      
      // If it's a specific page tab, smooth scroll to it
      if (tabId === "tab-models") {
        document.querySelector(".comparison-section").scrollIntoView({ behavior: 'smooth' });
      } else if (tabId === "tab-apple") {
        switchAsset('aapl');
        document.querySelector(".dashboard-header").scrollIntoView({ behavior: 'smooth' });
      } else if (tabId === "tab-gold") {
        switchAsset('gold');
        document.querySelector(".dashboard-header").scrollIntoView({ behavior: 'smooth' });
      } else if (tabId === "tab-dashboard") {
        document.querySelector(".dashboard-header").scrollIntoView({ behavior: 'smooth' });
      } else {
        document.getElementById("panel-intro").scrollIntoView({ behavior: 'smooth' });
      }
    });
  });
}

/**
 * Toggles the visibility of panels and headers depending on the active tab
 */
function showTab(tabId) {
  const introPanel = document.getElementById("panel-intro");
  const dashboardPanel = document.getElementById("panel-dashboard");
  const header = document.querySelector(".dashboard-header");

  if (tabId === "tab-intro") {
    introPanel.classList.add("active");
    dashboardPanel.classList.remove("active");
    header.style.display = "none";
  } else {
    introPanel.classList.remove("active");
    dashboardPanel.classList.add("active");
    header.style.display = "flex";
  }
}

/**
 * CTA Button Click Handler - Enters the interactive dashboard smoothly
 */
function enterDashboard() {
  const dashboardNav = document.querySelector(".sidebar .nav-item[data-tab='tab-dashboard']");
  if (dashboardNav) {
    dashboardNav.click(); // Triggers high quality transition to active charts panel!
  }
}

/**
 * Switches the displayed financial asset (Apple vs. Gold)
 * @param {string} asset - 'aapl' or 'gold'
 */
function switchAsset(asset) {
  currentAsset = asset;
  
  // 1. Update Selector Buttons styling
  document.getElementById("btn-aapl").classList.toggle("active", asset === 'aapl');
  document.getElementById("btn-gold").classList.toggle("active", asset === 'gold');
  
  // 2. Fetch appropriate data series
  const data = window.SahmData[asset];
  const lastRecord = data[data.length - 1];
  
  // 3. Render KPIs
  renderKPIs(lastRecord, asset);
  
  // 4. Render main price chart (Close + SMAs + Bollinger Bands)
  renderPriceChart(data, asset);
  
  // 5. Render sub-plots (RSI and MACD)
  renderRSIChart(data);
  renderMACDChart(data);
  
  // 6. Render Prediction Box (التنبؤ الاستثماري)
  renderPredictionBox(lastRecord, asset);
  
  // 7. Render NLP & ML Model comparison tables
  renderModelTables(asset);
  
  // 8. Render AI Sentiment News Feed
  renderNewsFeed(asset);
}

/**
 * Renders the top KPI boxes with formatted metrics
 */
function renderKPIs(record, asset) {
  // Price formatting
  const closeVal = record.close;
  const prevClose = window.SahmData[asset][window.SahmData[asset].length - 2].close;
  const priceDiff = (closeVal - prevClose).toFixed(2);
  const pctDiff = ((priceDiff / prevClose) * 100).toFixed(2);
  const isUp = priceDiff >= 0;
  
  const closeValFormatted = asset === 'aapl' ? `$${closeVal.toFixed(2)}` : `$${closeVal.toFixed(2)}`;
  document.getElementById("kpi-close-val").innerText = closeValFormatted;
  
  const changeHtml = isUp 
    ? `<span style="color: var(--accent-green);"><i class="fa-solid fa-circle-chevron-up"></i> +${priceDiff} (+${pctDiff}%)</span>`
    : `<span style="color: var(--accent-red);"><i class="fa-solid fa-circle-chevron-down"></i> ${priceDiff} (${pctDiff}%)</span>`;
  document.getElementById("kpi-close-change").innerHTML = changeHtml;
  
  // RSI formatting
  const rsiVal = record.rsi;
  document.getElementById("kpi-rsi-val").innerText = rsiVal.toFixed(1);
  let rsiStatus = "معتدل";
  let rsiColor = "var(--text-secondary)";
  if (rsiVal > 70) { rsiStatus = "شراء مفرط (Overbought)"; rsiColor = "var(--accent-red)"; }
  else if (rsiVal < 30) { rsiStatus = "بيع مفرط (Oversold)"; rsiColor = "var(--accent-green)"; }
  document.getElementById("kpi-rsi-status").innerText = rsiStatus;
  document.getElementById("kpi-rsi-status").style.color = rsiColor;
  
  // Sentiment Score
  const sentVal = record.ensemble_score_mean;
  document.getElementById("kpi-sent-val").innerText = sentVal.toFixed(3);
  let sentStatus = "محايد";
  let sentColor = "var(--text-secondary)";
  if (sentVal > 0.15) { sentStatus = "إيجابي قوي"; sentColor = "var(--accent-green)"; }
  else if (sentVal > 0.05) { sentStatus = "إيجابي خفيف"; sentColor = "rgba(46, 204, 113, 0.7)"; }
  else if (sentVal < -0.15) { sentStatus = "سلبي قوي"; sentColor = "var(--accent-red)"; }
  else if (sentVal < -0.05) { sentStatus = "سلبي خفيف"; sentColor = "rgba(231, 76, 60, 0.7)"; }
  document.getElementById("kpi-sent-status").innerText = sentStatus;
  document.getElementById("kpi-sent-status").style.color = sentColor;
  
  // Recommendation Signal
  const signalVal = record.signal;
  const signalScoreVal = record.signal_score;
  const scoreDisplay = `تقييم مؤشر الإشارة: ${signalScoreVal >= 0 ? '+' : ''}${signalScoreVal} / 3`;
  
  const signalBadge = document.getElementById("kpi-signal-val");
  signalBadge.innerText = translateSignal(signalVal);
  document.getElementById("kpi-signal-score").innerText = scoreDisplay;
  
  // Style signal color
  signalBadge.style.color = signalVal === 'BUY' ? 'var(--accent-green)' : (signalVal === 'SELL' ? 'var(--accent-red)' : 'var(--accent-gold)');
}

/**
 * Translates BUY/HOLD/SELL labels to Arabic
 */
function translateSignal(sig) {
  if (sig === 'BUY') return 'شِــرَاء';
  if (sig === 'SELL') return 'بَــيْــع';
  return 'إمْـسَـاك';
}

/**
 * Renders the main Price Chart using Chart.js
 */
function renderPriceChart(series, asset) {
  const ctx = document.getElementById("mainPriceChart").getContext("2d");
  
  // Destroy old instance if exists
  if (priceChartInstance) {
    priceChartInstance.destroy();
  }
  
  // Limit data points shown to last 120 trading days for absolute visual clarity and smoothness
  const recentData = series.slice(-120);
  const labels = recentData.map(d => d.date);
  const closes = recentData.map(d => d.close);
  const sma10 = recentData.map(d => d.sma_10);
  const sma20 = recentData.map(d => d.sma_20);
  const sma50 = recentData.map(d => d.sma_50);
  const bbUpper = recentData.map(d => d.bb_upper);
  const bbLower = recentData.map(d => d.bb_lower);
  
  // Title update
  document.getElementById("price-chart-title").innerText = 
    asset === 'aapl' 
      ? 'مخطط أسعار إغلاق أسهم Apple مع المتوسطات المتحركة ونطاقات بولينجر (120 يوماً)' 
      : 'مخطط أسعار إغلاق الذهب التاريخي مع المتوسطات المتحركة ونطاقات بولينجر (120 يوماً)';
  
  priceChartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [
        {
          label: 'سعر الإغلاق',
          data: closes,
          borderColor: '#f0f3f6',
          borderWidth: 2,
          pointRadius: 0,
          pointHoverRadius: 5,
          fill: false,
          tension: 0.1,
          z: 5
        },
        {
          label: 'SMA 10',
          data: sma10,
          borderColor: '#ff9f43',
          borderWidth: 1.2,
          pointRadius: 0,
          fill: false,
          tension: 0.1,
          z: 3
        },
        {
          label: 'SMA 20',
          data: sma20,
          borderColor: 'rgba(241, 196, 15, 0.8)',
          borderWidth: 1.2,
          pointRadius: 0,
          fill: false,
          tension: 0.1,
          z: 2
        },
        {
          label: 'بولينجر العلوي',
          data: bbUpper,
          borderColor: 'rgba(46, 204, 113, 0.25)',
          borderWidth: 1,
          borderDash: [5, 5],
          pointRadius: 0,
          fill: false,
          z: 1
        },
        {
          label: 'بولينجر السفلي',
          data: bbLower,
          borderColor: 'rgba(46, 204, 113, 0.25)',
          borderWidth: 1,
          borderDash: [5, 5],
          pointRadius: 0,
          fill: '-1', // Fills backward to Bollinger Upper (index 3)
          backgroundColor: 'rgba(46, 204, 113, 0.02)',
          z: 0
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: 'index',
        intersect: false,
      },
      plugins: {
        legend: {
          display: false // We use our custom styled headers
        },
        tooltip: {
          backgroundColor: 'rgba(16, 18, 27, 0.95)',
          titleFont: CHART_FONT,
          bodyFont: CHART_FONT,
          borderColor: 'rgba(255, 255, 255, 0.1)',
          borderWidth: 1,
          padding: 10,
          rtl: true,
          callbacks: {
            title: (context) => `التاريخ: ${context[0].label}`
          }
        }
      },
      scales: {
        x: {
          grid: {
            color: 'rgba(255, 255, 255, 0.03)'
          },
          ticks: {
            font: CHART_FONT,
            color: '#8b949e',
            maxTicksLimit: 8
          }
        },
        y: {
          position: 'right',
          grid: {
            color: 'rgba(255, 255, 255, 0.03)'
          },
          ticks: {
            font: CHART_FONT,
            color: '#8b949e',
            callback: (value) => `$${value}`
          }
        }
      }
    }
  });
}

/**
 * Renders the RSI Oscillator Chart
 */
function renderRSIChart(series) {
  const ctx = document.getElementById("rsiChart").getContext("2d");
  if (rsiChartInstance) rsiChartInstance.destroy();
  
  const recentData = series.slice(-120);
  const labels = recentData.map(d => d.date);
  const rsiVals = recentData.map(d => d.rsi);
  
  rsiChartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: 'RSI (14)',
        data: rsiVals,
        borderColor: '#9b59b6',
        borderWidth: 1.5,
        pointRadius: 0,
        fill: false,
        tension: 0.15
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: 'rgba(16, 18, 27, 0.95)',
          titleFont: CHART_FONT,
          bodyFont: CHART_FONT,
          rtl: true
        },
        annotation: {
          annotations: {
            lineUpper: {
              type: 'line',
              yMin: 70,
              yMax: 70,
              borderColor: 'rgba(231, 76, 60, 0.6)',
              borderWidth: 1,
              borderDash: [6, 4],
              label: {
                display: true,
                content: 'Overbought (70)',
                position: 'start',
                backgroundColor: 'rgba(231, 76, 60, 0.2)',
                color: 'var(--accent-red)',
                font: { size: 9, family: 'Cairo' }
              }
            },
            lineLower: {
              type: 'line',
              yMin: 30,
              yMax: 30,
              borderColor: 'rgba(46, 204, 113, 0.6)',
              borderWidth: 1,
              borderDash: [6, 4],
              label: {
                display: true,
                content: 'Oversold (30)',
                position: 'start',
                backgroundColor: 'rgba(46, 204, 113, 0.2)',
                color: 'var(--accent-green)',
                font: { size: 9, family: 'Cairo' }
              }
            }
          }
        }
      },
      scales: {
        x: {
          grid: { color: 'rgba(255,255,255,0.02)' },
          ticks: { font: CHART_FONT, color: '#8b949e', maxTicksLimit: 8 }
        },
        y: {
          position: 'right',
          min: 10,
          max: 90,
          grid: { color: 'rgba(255,255,255,0.02)' },
          ticks: { font: CHART_FONT, color: '#8b949e', stepSize: 20 }
        }
      }
    }
  });
}

/**
 * Renders the MACD Convergence-Divergence Histogram & lines
 */
function renderMACDChart(series) {
  const ctx = document.getElementById("macdChart").getContext("2d");
  if (macdChartInstance) macdChartInstance.destroy();
  
  const recentData = series.slice(-120);
  const labels = recentData.map(d => d.date);
  const macdLine = recentData.map(d => d.macd_line);
  const macdSignal = recentData.map(d => d.macd_signal);
  const macdHist = recentData.map(d => d.macd_hist);
  
  // Custom colors array for positive vs negative bars in histogram
  const barColors = macdHist.map(val => val >= 0 ? 'rgba(46, 204, 113, 0.45)' : 'rgba(231, 76, 60, 0.45)');
  
  macdChartInstance = new Chart(ctx, {
    data: {
      labels: labels,
      datasets: [
        {
          type: 'line',
          label: 'MACD Line',
          data: macdLine,
          borderColor: '#3498db',
          borderWidth: 1.2,
          pointRadius: 0,
          fill: false,
          tension: 0.1
        },
        {
          type: 'line',
          label: 'Signal Line',
          data: macdSignal,
          borderColor: '#e67e22',
          borderWidth: 1.2,
          pointRadius: 0,
          fill: false,
          tension: 0.1
        },
        {
          type: 'bar',
          label: 'Histogram',
          data: macdHist,
          backgroundColor: barColors,
          barPercentage: 0.85,
          categoryPercentage: 0.85
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: 'rgba(16, 18, 27, 0.95)',
          titleFont: CHART_FONT,
          bodyFont: CHART_FONT,
          rtl: true
        }
      },
      scales: {
        x: {
          grid: { color: 'rgba(255,255,255,0.02)' },
          ticks: { font: CHART_FONT, color: '#8b949e', maxTicksLimit: 8 }
        },
        y: {
          position: 'right',
          grid: { color: 'rgba(255,255,255,0.02)' },
          ticks: { font: CHART_FONT, color: '#8b949e' }
        }
      }
    }
  });
}

/**
 * Updates the custom circular gauges and linear bars in prediction panel
 */
function renderPredictionBox(record, asset) {
  const signal = record.signal;
  const badge = document.getElementById("final-signal-badge");
  const desc = document.getElementById("final-signal-desc");
  
  // Set class based on signal
  badge.className = `signal-badge ${signal.toLowerCase()}`;
  badge.innerText = translateSignal(signal);
  
  // Circle SVG Dash Offset Calculation
  // dasharray is 471.2 (circumference of 75 radius).
  const circle = document.getElementById("signal-progress-circle");
  let percentageOffset = 0;
  
  // Hardcoded overall training period statistics matching user graduation report
  let buyPct = 0;
  let holdPct = 0;
  let sellPct = 0;
  
  if (asset === 'aapl') {
    buyPct = 19.2;
    holdPct = 78.9;
    sellPct = 1.9;
  } else { // Gold
    buyPct = 22.0;
    holdPct = 77.3;
    sellPct = 0.7;
  }
  
  // Dynamic visual parameters depending on the active signal
  if (signal === 'BUY') {
    desc.innerText = "تنبؤ بالشراء";
    badge.style.textShadow = "0 0 10px rgba(46, 204, 113, 0.6)";
    circle.style.stroke = "var(--accent-green)";
    percentageOffset = 471.2 * (1 - buyPct/100);
  } else if (signal === 'SELL') {
    desc.innerText = "تنبؤ بالبيع";
    badge.style.textShadow = "0 0 10px rgba(231, 76, 60, 0.6)";
    circle.style.stroke = "var(--accent-red)";
    percentageOffset = 471.2 * (1 - sellPct/100);
  } else { // HOLD
    desc.innerText = "تنبؤ بالإمساك";
    badge.style.textShadow = "0 0 10px rgba(241, 196, 15, 0.6)";
    circle.style.stroke = "var(--accent-gold)";
    percentageOffset = 471.2 * (1 - holdPct/100);
  }
  
  // Apply circle dash offset animation
  circle.style.strokeDashoffset = percentageOffset;
  
  // Update percentages texts
  document.getElementById("stat-buy-pct").innerText = `${buyPct.toFixed(1)}%`;
  document.getElementById("stat-hold-pct").innerText = `${holdPct.toFixed(1)}%`;
  document.getElementById("stat-sell-pct").innerText = `${sellPct.toFixed(1)}%`;
  
  // Animate linear progress bar widths
  document.getElementById("bar-buy-fill").style.width = `${buyPct}%`;
  document.getElementById("bar-hold-fill").style.width = `${holdPct}%`;
  document.getElementById("bar-sell-fill").style.width = `${sellPct}%`;
}

/**
 * Populates model evaluation data sheets in dashboard tables
 */
function renderModelTables(asset) {
  const assetName = asset === 'aapl' ? 'AAPL' : 'Gold';
  
  // ── 1. Populate NLP metrics ──
  const nlpData = window.SahmData.nlpMetrics[assetName];
  const nlpBody = document.querySelector("#nlp-metrics-table tbody");
  nlpBody.innerHTML = "";
  
  nlpData.forEach(row => {
    const isBest = row.Model === 'Logistic Regression';
    const tr = document.createElement("tr");
    if (isBest) tr.className = "highlight-model";
    
    tr.innerHTML = `
      <td>${row.Model} ${isBest ? '<span class="badge-best">الأفضل</span>' : ''}</td>
      <td style="font-family: monospace;">${(row.Accuracy * 100).toFixed(2)}%</td>
      <td style="font-family: monospace;">${(row.Precision * 100).toFixed(2)}%</td>
      <td style="font-family: monospace;">${(row.Recall * 100).toFixed(2)}%</td>
      <td style="font-family: monospace;">${(row['F1-Score'] * 100).toFixed(2)}%</td>
    `;
    nlpBody.appendChild(tr);
  });
  
  // ── 2. Populate ML predictions metrics ──
  const mlData = window.SahmData.mlMetrics[assetName];
  const mlBody = document.querySelector("#ml-metrics-table tbody");
  mlBody.innerHTML = "";
  
  mlData.forEach(row => {
    const isBest = row.Model === 'XGBoost';
    const tr = document.createElement("tr");
    if (isBest) tr.className = "highlight-model";
    
    tr.innerHTML = `
      <td>${row.Model} ${isBest ? '<span class="badge-best">الأفضل</span>' : ''}</td>
      <td style="font-family: monospace; direction: ltr;">${row.R2.toFixed(4)}</td>
      <td style="font-family: monospace;">${row.RMSE.toFixed(4)}</td>
      <td style="font-family: monospace;">${row.MAE.toFixed(4)}</td>
      <td style="font-family: monospace; color: var(--accent-green);">${row.DirAcc.toFixed(2)}%</td>
    `;
    mlBody.appendChild(tr);
  });
}

/**
 * Generates dynamic recent news feed articles with dynamic badge labels
 */
function renderNewsFeed(asset) {
  const assetName = asset === 'aapl' ? 'AAPL' : 'Gold';
  const newsList = window.SahmData.news[assetName];
  const container = document.getElementById("news-feed-container");
  
  container.innerHTML = "";
  
  newsList.forEach(item => {
    const card = document.createElement("div");
    card.className = "news-card glass";
    
    const sentClass = item.sentiment === 'Positive' ? 'pos' : (item.sentiment === 'Negative' ? 'neg' : 'neu');
    const sentText = item.sentiment === 'Positive' ? 'إيجابي' : (item.sentiment === 'Negative' ? 'سلبي' : 'محايد');
    const sentIcon = item.sentiment === 'Positive' ? 'fa-face-smile' : (item.sentiment === 'Negative' ? 'fa-face-frown' : 'fa-face-meh');
    
    card.innerHTML = `
      <div class="news-content">
        <span class="news-date"><i class="fa-regular fa-calendar-days" style="margin-left: 6px;"></i> ${item.date}</span>
        <h4 class="news-headline" style="direction: ltr; text-align: left;">${item.headline}</h4>
        <div class="news-metrics">
          <span><i class="fa-solid fa-calculator"></i> VADER: <b>${item.vader >= 0 ? '+' : ''}${item.vader.toFixed(2)}</b></span>
          <span><i class="fa-solid fa-microchip"></i> Logistic Reg: <b>${item.lr >= 0 ? '+' : ''}${item.lr.toFixed(2)}</b></span>
          <span><i class="fa-solid fa-brain"></i> RoBERTa: <b>${item.roberta >= 0 ? '+' : ''}${item.roberta.toFixed(2)}</b></span>
        </div>
      </div>
      <div class="news-side">
        <span class="sent-badge ${sentClass}">
          <i class="fa-solid ${sentIcon}"></i>
          <span>${sentText}</span>
        </span>
      </div>
    `;
    
    container.appendChild(card);
  });
}

/**
 * Toggles the sidebar visibility with a smooth slide transition
 */
function toggleSidebar() {
  const container = document.querySelector(".app-container");
  container.classList.toggle("sidebar-hidden");
  
  // Toggle the icon of the button for cool UX
  const icon = document.querySelector("#sidebar-toggle i");
  if (container.classList.contains("sidebar-hidden")) {
    icon.className = "fa-solid fa-angles-left";
  } else {
    icon.className = "fa-solid fa-bars";
  }
}
