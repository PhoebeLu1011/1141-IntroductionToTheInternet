## **Course:** 114-1 Introduction to the Internet

## Table of Contents
### HW1
* [Code](https://github.com/PhoebeLu1011/personalweb)
* [Description](#homework1)

### HW2
* [Code](https://github.com/PhoebeLu1011/1141-IntroductionToTheInternet/tree/main/HW2)
* [Description](#homework2)


### homework1
### Personal Website

<img src="/img/hw1.png" width="400"/>

This is my **personal website** !<br>
It introduces who I am, my experiences, projects, and life. <br>
The source code is maintained in a separate repository.

#### Links:
- Website Repo : [personalweb](https://github.com/PhoebeLu1011/personalweb)  
- My Website : [My Personal Website](https://phoebelu1011.github.io/personalweb/)
               [NTNU Website](https://web.ntnu.edu.tw/~41271122h/)

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

  
