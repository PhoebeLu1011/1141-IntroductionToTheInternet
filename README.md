## 114-1 Introduction to the Internet

- **Course:** 114-1 Introduction to the Internet
- 
### Homework 1 : Personal Website

<img src="/img/hw1.png" width="400"/>

This is my **personal website** !<br>
It introduces who I am, my experiences, projects, and life. <br>
The source code is maintained in a separate repository.

#### Links:
- Website Repo : [personalweb](https://github.com/PhoebeLu1011/personalweb)  
- My Website : [My Personal Website](https://phoebelu1011.github.io/personalweb/)

The website contains the following sections:
- **About Me** – a brief introduction of myself  
- **My Education & Experience** – academic background, research, and club activities  
- **Portfolio** – selected projects and works  
- **Blog** – reflections and personal thoughts
  
#### Project Structure  
```
personalweb/
│── index.html # Homepage
│── girlstech.html # Blog page Ⅰ
│── qcewksexp.html # Blog page Ⅱ
│── css/ # Stylesheets
│── js/ # JavaScript files
│── img/ # Images
│── scss/ 
│── lib/ 
```
### Homework 2 
### 1. 台北城市儀表板 API 呼叫展示
### 2. AI API 串接展示
#### 📄 更新說明
1. [AItest.tsx](https://github.com/PhoebeLu1011/1141-IntroductionToTheInternet/blob/main/HW2/AItest.tsx)：
   - 整合 NPSHeader.tsx，可將國家公園資料 JSON 作為上下文傳給模型，強化回答內容。
     ```tsx
     import NpsHeader from './NpsHeader';
     ```
   - 介面優化
2. 新增 [NpsHeader.tsx](https://github.com/PhoebeLu1011/1141-IntroductionToTheInternet/blob/main/HW2/NpsHeader.tsx):
   - 連接美國國家公園（NPS）API，讓使用者可以查詢公園、營地、遊客中心等相關資訊。
   - 使用者可自行選擇多個景點，系統會將這些地點的資訊一併提供給 Gemini 模型，讓模型根據所選地點產生更貼近實際旅遊情境的回答（例如自動規劃行程、推薦活動或生成圖片）。
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

  
