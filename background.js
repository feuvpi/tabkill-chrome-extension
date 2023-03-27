// Set the initial timer interval to 15 minutes
const TIMER_INTERVAL = 15 * 60 * 1000;

// Create an empty object to store the suspended tabs
let suspendedTabs = {};

// Add an event listener to detect when a tab is updated
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  // If the tab is updated with a URL, clear its existing timer and start a new one
  if (changeInfo.url) {
    clearTimeout(suspendedTabs[tabId]?.timerId);
    suspendedTabs[tabId] = {
      url: changeInfo.url,
      timerId: setTimeout(() => {
        // If the tab has not been active for the specified interval, suspend it and create a div
        chrome.tabs.executeScript(tabId, {
          code: `
            const div = document.createElement('div');
            div.style.position = 'absolute';
            div.style.top = 0;
            div.style.left = 0;
            div.style.width = '${tab.width}px';
            div.style.height = '${tab.height}px';
            div.style.background = 'rgba(255, 0, 0, 0.6)';
            div.style.display = 'flex';
            div.style.justifyContent = 'center';
            div.style.alignItems = 'center';
            div.innerHTML = '<span style="color: white; font-size: 2em;">Tab Suspended</span>';
            const body = document.getElementsByTagName('body')[0];
            body.appendChild(div);
            document.addEventListener('click', () => {
              chrome.tabs.update(${tabId}, {url: '${changeInfo.url}'});
              div.remove();
            });
            `
        });
        chrome.tabs.executeScript(tabId, {code: 'window.stop();'});
      }, TIMER_INTERVAL)
    };
  }
});

// Add an event listener to detect when a tab is removed
chrome.tabs.onRemoved.addListener((tabId) => {
  // If the tab is removed, remove it from the suspendedTabs object as well
  delete suspendedTabs[tabId];
});

// Add an event listener to detect when a tab is activated
chrome.tabs.onActivated.addListener((activeInfo) => {
  // If a tab is activated, clear its existing timer
  clearTimeout(suspendedTabs[activeInfo.tabId]?.timerId);
});
