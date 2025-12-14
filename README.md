## **Course:** 114-1 Introduction to the Internet

## Table of Contents

## Final Project - Breezy Day
### [Repo.](https://github.com/PhoebeLu1011/BreezyDay)/[YT](https://youtu.be/x_4jhf-zvhI)/[Website](https://breezyday-8z2u.onrender.com)
組員:

41271122H 盧姵帆

41171131H 李怡安

## HW Overview
|HW|Repo./Code|Video|Description|Website|Extra Point|
|---|---|---|---|---|---|
|HW1|[Repo.](https://github.com/PhoebeLu1011/personalweb)|-|[Description](#homework1)|[My Personal Website](https://phoebelu1011.github.io/personalweb/)|[NTNU Website](https://web.ntnu.edu.tw/~41271122h/)|
|HW2|[Code](https://github.com/PhoebeLu1011/1141-IntroductionToTheInternet/tree/main/HW2)|[台北城市儀表板API](https://youtu.be/zo0HDsH75ZI)/[AI API](https://youtu.be/J5DNlgfXk50)|[Description](#homework2)|-|-|
|HW3|[Repo.](https://github.com/PhoebeLu1011/1141ITTI_HW3)|[Demo](https://youtu.be/ylLsdZcfeHw)|[Description](#HW3)|-|[Repo.](https://github.com/PhoebeLu1011/TravelRecord)/[Render](https://travelrecord.onrender.com)|
|HW4|[Repo.](https://github.com/PhoebeLu1011/1141ITTI_HW3)|-|-|[Render](https://one141internet-hw3.onrender.com)|[Railway](1141ittihw3-production.up.railway.app)|


### homework1
### Personal Website

<img src="/img/hw1.png" width="400"/>

#### Website Repo : [personalweb](https://github.com/PhoebeLu1011/personalweb)  
#### My Website : [My Personal Website](https://phoebelu1011.github.io/personalweb/) [NTNU Website](https://web.ntnu.edu.tw/~41271122h/)

### homework2 
### 1. 台北城市儀表板 API 呼叫展示
[Youtube Link](https://youtu.be/zo0HDsH75ZI)
### 2. AI API 串接展示
#### 展示影片:
[Youtube Link](https://youtu.be/J5DNlgfXk50)
#### 程式碼:
[code](https://github.com/PhoebeLu1011/1141-IntroductionToTheInternet/tree/main/HW2)

#### 更新說明
1. [AItest.tsx](https://github.com/PhoebeLu1011/1141-IntroductionToTheInternet/blob/main/HW2/AItest.tsx)：
   
   - 整合 NPSHeader.tsx，可將國家公園資料 JSON 作為上下文傳給模型，強化回答內容。
     
     ```tsx
     import NpsHeader from './NpsHeader';
     ```
     
   - 介面優化
     |圖示|說明|
     |---------|----------|
     |<img src="/HW2/IMG/4.png" width="500"/>|初始介面|
     |<img src="/HW2/IMG/3.png" width="500"/>|按下Fetch鍵，顯示使用者所選擇範圍之資訊，選擇按鈕旁的`官方頁面`，點下之後會跳轉至該國家公園頁面，讓使用者可以獲取更多相關資訊|
     |<img src="/HW2/IMG/2.png" width="500"/>|使用者輸入問題，並同時將所選擇景點一併交給gemini模型，生成符合使用者指令的回答|

     
  
     
3. 新增 [NpsHeader.tsx](https://github.com/PhoebeLu1011/1141-IntroductionToTheInternet/blob/main/HW2/NpsHeader.tsx):

   
   - 連接美國國家公園（NPS）API，讓使用者可以查詢公園、營地、遊客中心等相關資訊。
  
     
   - 使用者可自行選擇多個景點，系統會將這些地點的資訊一併提供給 Gemini 模型，讓模型根據使用者所選擇的地點產生與輸入相應的回覆(像是自動規劃行程、推薦活動）。
  
     
   ```tsx
    function chooseItem(p: ParkLike) {
    setSelectedList(prev => {
      const exists = prev.some(x =>
        (x.id && p.id && x.id === p.id) ||
        ((x.fullName || x.name) === (p.fullName || p.name))
      );
      const next = exists ? prev : [...prev, p];
      const payload = next.map(it => ({
        resource,
        title: it.fullName || it.name || it.title || "(No title)",
        states: it.states || undefined,
        parkCode: it.parkCode || undefined,
        description: it.description || "",
        image: it.images?.[0]?.url || undefined,
        officialUrl: it.url || undefined,
        coords: it.latitude && it.longitude ? { lat: it.latitude, lng: it.longitude } : undefined,
        activities: (it.activities || []).map(a => a.name),
      }));

      onContext(JSON.stringify(payload, null, 2));
      return next;
    });
    }
   ```

### HW3
個人網站串接API

我在我的個人網站上串接了兩個api
### | 使用的 API
### 1. Github API

<img src="/img/hw3_repo.png" width="500"/>

`GithubRepo.jsx` 用fetch()呼叫 GitHub API:
```jsx
const res = await fetch(`https://api.github.com/users/${username}/repos?per_page=100`, { headers });
```
### 2. KKBOX API
<img src="/img/hw3_kkbox.png" width="500"/>
此API用來顯示我的播放清單（含封面、歌名、歌手），並新增一個設定面板(可隱藏)，可輸入 Client ID / Client Secret ，按下取得 Token 後將會自動連線至 KKBOX 並載入我的播放清單。
#### | 功能
- 顯示播放清單標題、歌曲清單與專輯封面
- 可橫向滑動瀏覽曲目
  
#### | 掛載
於`index.html`的Blog Section的後方新增 :
```html
  <div id="musicroot"></div>
```
於App.jsx掛載元件 :
```jsx
import Music from './music.jsx'; 
export default function App1() {
  return (
    <main style={{ padding: 24 }}>
      <Music />
    </main>
  );
}
// React 掛載點
const el = document.getElementById('musicroot');
if (el) {
  createRoot(el).render(<App1 />);
}
```

#### | CORS 問題處理說明
由於 KKBOX API 不允許從瀏覽器直接呼叫（因為CORS 限制），因此新增了 server.js ，並在其中利用 fetch() 呼叫 KKBOX Token API:
```js
    const url = `https://api.kkbox.com/v1.1/featured-playlists/${id}?territory=${territory}`;
    const r = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
```

#### | 執行方式

(1) 安裝後端並啟動（PORT: 4000）：
```cmd
npm install express node-fetch cors
node server.js
```

(2) 另外開一個cmd啟動前端（PORT: 5173）：
```cmd
npm install
npm run dev
```
  
