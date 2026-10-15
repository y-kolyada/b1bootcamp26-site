import fs from 'fs';
import path from 'path';

const siteDir = '/home/ik/lab/ai-factory-builder/courses/b1bootcamp26-site';

const LANGUAGES = [
  { code: 'ru', suffix: '', name: 'RU', ariaLabel: 'Выбор языка' },
  { code: 'uk', suffix: '-uk', name: 'UK', ariaLabel: 'Вибір мови' },
  { code: 'be', suffix: '-be', name: 'BE', ariaLabel: 'Выбар мовы' },
  { code: 'kk', suffix: '-kk', name: 'KK', ariaLabel: 'Тілді таңдау' },
  { code: 'ky', suffix: '-ky', name: 'KY', ariaLabel: 'Тилди тандоо' },
  { code: 'ka', suffix: '-ka', name: 'KA', ariaLabel: 'ენის არჩევა' },
  { code: 'en', suffix: '-en', name: 'EN', ariaLabel: 'Language selection' },
  { code: 'de', suffix: '-de', name: 'DE', ariaLabel: 'Sprachauswahl' }
];

const TRACKS = ['index', '01', '02', 'glossary'];

// Helper to generate the 8-language switcher HTML block
function renderLangSwitcher(track, activeLangCode, switcherAriaLabel) {
  let html = `    <div class="lang-switcher" aria-label="${switcherAriaLabel}">\n`;
  for (const lang of LANGUAGES) {
    const filename = `${track}${lang.suffix}.html`;
    const isActive = lang.code === activeLangCode;
    if (isActive) {
      html += `      <a href="${filename}" class="active" aria-current="page">${lang.name}</a>\n`;
    } else {
      html += `      <a href="${filename}">${lang.name}</a>\n`;
    }
  }
  html += `    </div>`;
  return html;
}

// Translations dictionary for new languages
const STUB_DATA = {
  be: {
    lang: 'be',
    subBrand: 'aibootcamp-teens',
    three: 'заданне · дзеянне · праверка',
    trayAria: 'Налады адлюстравання і мова',
    switcherAria: 'Выбар мовы',
    fontAria: 'Памер шрыфту',
    fontS: 'Дробны шрыфт',
    fontM: 'Стандартны шрыфт',
    fontL: 'Вялікі шрыфт',
    themeAria: 'Змяніць тэму (Дзень/Ноч)',
    navAria: 'Заняткі',
    navItems: [
      { num: '1', title: 'Першая пастаўка', href: '01-be.html' },
      { num: '2', title: 'Патрабаванні: што значыць «зроблена»', href: '02-be.html' },
      { num: '3', title: 'Гісторыя змен', later: true },
      { num: '4', title: 'Уласная праверка', later: true },
      { num: '5', title: 'Праверка без цябе', later: true },
      { num: '6', title: 'Калі ламаецца', later: true },
      { num: '7', title: 'Зялёная, якая нічога не значыць', later: true },
      { num: '8', title: 'Здача: паказаць і абараніць', later: true }
    ],
    glossaryNav: '📖 Слоўнік паняццяў',
    footer: 'Сайт створаны тым самым аснашчэннем, што і ва ўдзельнікаў: звычайны HTML і CSS, праверка на bash, публікацыя праз GitHub Pages.',
    pages: {
      index: {
        title: 'AI Bootcamp · курс з васьмі заняткаў',
        h1: 'Восем заняткаў, і на кожным ты нешта аддаеш',
        lead: 'Курс пра тое, як працаваць з ІІ так, каб атрымліваўся прадукт, а не размова. Ты пішаш заданне, ІІ робіць, праверка адказвае «так» ці «не». Восем разоў.',
        stubH2: 'Матэрыялы курсу запланаваны да перакладу ў перспектыве',
        stubP1: 'Поўная працоўная версія сайта курсу з пакрокавымі ўрокамі, тэрмінальнымі камандамі і скрыптамі праверкі на дадзены момант апублікавана і падтрымліваецца на русском языке.',
        stubP2: 'Вы можаце азнаёміцца з поўнай версіяй сайта і пачаць навучанне:',
        btnText: 'Адкрыць галоўную старонку на русском языке →',
        btnHref: 'index.html'
      },
      '01': {
        title: 'Занятак 1 · Першая пастаўка · AI Bootcamp',
        h1: 'Занятак 1 · Першая пастаўка',
        lead: 'Да канца занятка ў цябе ёсць адрас у інтэрнэце, які можна скінуць сябру, і старонка па гэтым адрасе зроблена ІІ — па тваім заданні, а не па яго здагадцы.',
        stubH2: 'Матэрыялы занятка запланаваны да перакладу ў перспектыве',
        stubP1: 'Поўная працоўная версія занятка з пакрокавымі інструкцыямі, тэрмінальнымі камандамі і скрыптамі праверкі на дадзены момант апублікавана і падтрымліваецца на русском языке.',
        stubP2: 'Вы можаце прайсці занятак па поўнай арыгінальнай версіі:',
        btnText: 'Адкрыць Занятак 1 на русском языке →',
        btnHref: '01.html'
      },
      '02': {
        title: 'Занятак 2 · Патрабаванні: што значыць «зроблена» · AI Bootcamp',
        h1: 'Занятак 2 · Патрабаванні: што значыць «зроблена»',
        lead: 'ІІ робіць код, але не ведае, калі спыніцца. Калі няма крытэрыя прыёмкі — ён будзе прыдумляць бясконца. Вучымся пісаць умовы, якія можна праверыць аўтаматычна.',
        stubH2: 'Матэрыялы занятка запланаваны да перакладу ў перспектыве',
        stubP1: 'Поўная працоўная версія занятка з практыкай складаных прэдыкатаў, уласным скілам і тэстамі на дадзены момант апублікавана і падтрымліваецца на русском языке.',
        stubP2: 'Вы можаце прайсці занятак па поўнай арыгінальнай версіі:',
        btnText: 'Адкрыць Занятак 2 на русском языке →',
        btnHref: '02.html'
      },
      glossary: {
        title: 'Слоўнік паняццяў · AI Bootcamp',
        h1: 'Слоўнік паняццяў курсу',
        lead: 'Мы навучаем даросламу інжынернаму майстэрству, таму называем рэчы сваімі імёнамі. Але кожнае слова тут — гэта не білет на экзамене, а інструмент сілы, які вырашае канкрэтную задачу.',
        stubH2: 'Слоўнік паняццяў запланаваны да перакладу ў перспектыве',
        stubP1: 'Поўны слоўнік тэрмінаў з падрабязнымі тлумачэннямі і кантэкстнымі спасылкамі на ўрокі на дадзены момант даступны на русском языке.',
        stubP2: 'Вы можаце прагледзець поўны слоўнік у арыгінале:',
        btnText: 'Адкрыць Слоўнік паняццяў на русском языке →',
        btnHref: 'glossary.html'
      }
    }
  },
  kk: {
    lang: 'kk',
    subBrand: 'aibootcamp-teens',
    three: 'тапсырма · әрекет · тексеру',
    trayAria: 'Көрсету параметрлері және тіл',
    switcherAria: 'Тілді таңдау',
    fontAria: 'Қаріп өлшемі',
    fontS: 'Кіші қаріп',
    fontM: 'Стандартты қаріп',
    fontL: 'Үлкен қаріп',
    themeAria: 'Тақырыпты өзгерту (Күндіз/Түн)',
    navAria: 'Сабақтар',
    navItems: [
      { num: '1', title: 'Алғашқы тапсырыс', href: '01-kk.html' },
      { num: '2', title: 'Талаптар: «дайын» деген нені білдіреді', href: '02-kk.html' },
      { num: '3', title: 'Өзгерістер тарихы', later: true },
      { num: '4', title: 'Өзіндік тексеру', later: true },
      { num: '5', title: 'Сенсіз тексеру', later: true },
      { num: '6', title: 'Сынған кезде', later: true },
      { num: '7', title: 'Ештеңені білдірмейтін жасыл', later: true },
      { num: '8', title: 'Тапсырыс: көрсету және қорғау', later: true }
    ],
    glossaryNav: '📖 Түсініктер сөздігі',
    footer: 'Сайт қатысушылардікі сияқты құралдармен жасалған: таза HTML және CSS, bash арқылы тексеру, GitHub Pages арқылы жариялау.',
    pages: {
      index: {
        title: 'AI Bootcamp · сегіз сабақтан тұратын курс',
        h1: 'Сегіз сабақ және әрқайсысында сен нәтиже тапсырасың',
        lead: 'ЖИ-мен жұмыс істегенде жай сөйлесу емес, нақты өнім шығуы үшін жасалған курс. Сен тапсырма жазасың, ЖИ жасайды, тексеру «иә» немесе «жоқ» деп жауап береді. Сегіз рет.',
        stubH2: 'Курс материалдарын болашақта аудару жоспарланған',
        stubP1: 'Қадамдық сабақтары, терминал командалары және тексеру скрипттері бар сайттың толық нұсқасы қазіргі уақытта на русском языке жарияланған және қолдау көрсетілуде.',
        stubP2: 'Сіз сайттың толық нұсқасымен танысып, оқуды бастай аласыз:',
        btnText: 'Басты бетті на русском языке ашу →',
        btnHref: 'index.html'
      },
      '01': {
        title: '1-сабақ · Алғашқы тапсырыс · AI Bootcamp',
        h1: '1-сабақ · Алғашқы тапсырыс',
        lead: 'Сабақ соңында сенде досқа жіберуге болатын интернет мекенжайы болады, және бұл мекенжайдағы бет ЖИ-дің болжамымен емес, сенің тапсырмаң бойынша жасалған.',
        stubH2: 'Сабақ материалдарын болашақта аудару жоспарланған',
        stubP1: 'Қадамдық нұсқаулары, терминал командалары және тексеру скрипттері бар сабақтың толық нұсқасы қазіргі уақытта на русском языке қолжетімді.',
        stubP2: 'Сіз сабақты толық түпнұсқа нұсқасы бойынша өте аласыз:',
        btnText: '1-сабақты на русском языке ашу →',
        btnHref: '01.html'
      },
      '02': {
        title: '2-сабақ · Талаптар: «дайын» деген нені білдіреді · AI Bootcamp',
        h1: '2-сабақ · Талаптар: «дайын» деген нені білдіреді',
        lead: 'ЖИ код жазады, бірақ қашан тоқтау керегін білмейді. Қабылдау критерийі болмаса — ол шексіз қиялдай береді. Автоматты түрде тексеруге болатын шарттарды жазуды үйренеміз.',
        stubH2: 'Сабақ материалдарын болашақта аудару жоспарланған',
        stubP1: 'Күрделі предикаттар практикасы, жеке скил және тексеру сынақтары бар сабақтың толық нұсқасы қазіргі уақытта на русском языке қолжетімді.',
        stubP2: 'Сіз сабақты толық түпнұсқа нұсқасы бойынша өте аласыз:',
        btnText: '2-сабақты на русском языке ашу →',
        btnHref: '02.html'
      },
      glossary: {
        title: 'Түсініктер сөздігі · AI Bootcamp',
        h1: 'Курстың түсініктер сөздігі',
        lead: 'Біз ересектердің инженерлік кәсібін үйретеміз, сондықтан заттарды өз атымен атаймыз. Бірақ мұндағы әрбір сөз — емтихандағы сұрақ емес, нақты міндетті шешетін күш құралы.',
        stubH2: 'Түсініктер сөздігін болашақта аудару жоспарланған',
        stubP1: 'Егжей-тегжейлі түсіндірмелері және сабақтарға контексттік сілтемелері бар толық терминдер сөздігі қазіргі уақытта на русском языке қолжетімді.',
        stubP2: 'Сіз толық сөздікті түпнұсқада қарай аласыз:',
        btnText: 'Түсініктер сөздігін на русском языке ашу →',
        btnHref: 'glossary.html'
      }
    }
  },
  ky: {
    lang: 'ky',
    subBrand: 'aibootcamp-teens',
    three: 'тапшырма · аракет · текшерүү',
    trayAria: 'Көрсөтүү жөндөөлөрү жана тил',
    switcherAria: 'Тилди тандоо',
    fontAria: 'Ариптин өлчөмү',
    fontS: 'Кичине арип',
    fontM: 'Стандарттуу арип',
    fontL: 'Чоң арип',
    themeAria: 'Теманы алмаштыруу (Күндүз/Түн)',
    navAria: 'Сабактар',
    navItems: [
      { num: '1', title: 'Алгачкы тапшыруу', href: '01-ky.html' },
      { num: '2', title: 'Талаптар: «бүттү» деген эмнени билдирет', href: '02-ky.html' },
      { num: '3', title: 'Өзгөрүүлөрдүн тарыхы', later: true },
      { num: '4', title: 'Өздүк текшерүү', later: true },
      { num: '5', title: 'Сенсиз текшерүү', later: true },
      { num: '6', title: 'Бузулганда', later: true },
      { num: '7', title: 'Эч нерсени билдирбеген жашыл', later: true },
      { num: '8', title: 'Тапшыруу: көрсөтүү жана коргоо', later: true }
    ],
    glossaryNav: '📖 Түшүнүктөр сөздүгү',
    footer: 'Сайт катышуучулардыкындай эле куралдар менен жасалган: таза HTML жана CSS, bash аркылуу текшерүү, GitHub Pages аркылуу жарыялоо.',
    pages: {
      index: {
        title: 'AI Bootcamp · сегиз сабактан турган курс',
        h1: 'Сегиз сабак жана ар биринде сен бир нерсе тапшырасың',
        lead: 'ЖИ менен сүйлөшүү эмес, чыныгы продукт чыгышы үчүн иштөө жөнүндө курс. Сен тапшырма жазасың, ЖИ жасайт, текшерүү «ооба» же «жок» деп жооп берет. Сегиз жолу.',
        stubH2: 'Курс материалдары келечекте которулушу пландаштырылууда',
        stubP1: 'Кадамдык сабактары, терминал буйруктары жана текшерүү скрипттери бар сайттын толук версиясы азыркы учурда на русском языке жарыяланган жана колдоого алынат.',
        stubP2: 'Сиз сайттын толук версиясы менен таанышып, окууну баштасаңыз болот:',
        btnText: 'Башкы баракты на русском языке ачуу →',
        btnHref: 'index.html'
      },
      '01': {
        title: '1-сабак · Алгачкы тапшыруу · AI Bootcamp',
        h1: '1-сабак · Алгачкы тапшыруу',
        lead: 'Сабактын аягында сенде досуңа жөнөтүүгө боло турган интернет дареги болот, жана ал даректеги барак ЖИнин божомолу менен эмес, сенин тапшырмаң боюнча жасалган.',
        stubH2: 'Сабактын материалдары келечекте которулушу пландаштырылууда',
        stubP1: 'Кадамдык көрсөтмөлөрү, терминал буйруктары жана текшерүү скрипттери бар сабактын толук версиясы учурда на русском языке жеткиликтүү.',
        stubP2: 'Сиз сабакты толук түп нуска версиясы боюнча өтө аласыз:',
        btnText: '1-сабакты на русском языке ачуу →',
        btnHref: '01.html'
      },
      '02': {
        title: '2-сабак · Талаптар: «бүттү» деген эмнени билдирет · AI Bootcamp',
        h1: '2-сабак · Талаптар: «бүттү» деген эмнени билдирет',
        lead: 'ЖИ код жазат, бирок качан токтош керектигин билбейт. Эгерде кабыл алуу критерийи жок болсо — ал чексиз ойлоп таба берет. Автоматтык түрдө текшерүүгө боло турган шарттарды жазууну үйрөнөбүз.',
        stubH2: 'Сабактын материалдары келечекте которулушу пландаштырылууда',
        stubP1: 'Татаал предикаттар практикасы, жеке скил жана текшерүү сыноолору бар сабактын толук версиясы учурда на русском языке жеткиликтүү.',
        stubP2: 'Сиз сабакты толук түп нуска версиясы боюнча өтө аласыз:',
        btnText: '2-сабакты на русском языке ачуу →',
        btnHref: '02.html'
      },
      glossary: {
        title: 'Түшүнүктөр сөздүгү · AI Bootcamp',
        h1: 'Курстун түшүнүктөр сөздүгү',
        lead: 'Биз чоңдордун инженердик өнөрүн үйрөтөбүз, ошондуктан нерселерди өз аты менен атайбыз. Бирок бул жердеги ар бир сөз — экзамендеги билет эмес, конкреттүү маселени чечүүчү күчтүү курал.',
        stubH2: 'Түшүнүктөр сөздүгү келечекте которулушу пландаштырылууда',
        stubP1: 'Толук түшүндүрмөлөрү жана сабактарга контексттик шилтемелери бар терминдер сөздүгү учурда на русском языке жеткиликтүү.',
        stubP2: 'Сиз толук сөздүктү түп нускасында көрө аласыз:',
        btnText: 'Түшүнүктөр сөздүгүн на русском языке ачуу →',
        btnHref: 'glossary.html'
      }
    }
  },
  ka: {
    lang: 'ka',
    subBrand: 'aibootcamp-teens',
    three: 'დავალება · მოქმედება · შემოწმება',
    trayAria: 'ჩვენების პარამეტრები და ენა',
    switcherAria: 'ენის არჩევა',
    fontAria: 'შრიფტის ზომა',
    fontS: 'პატარა შრიფტი',
    fontM: 'სტანდარტული შრიფტი',
    fontL: 'დიდი შრიფტი',
    themeAria: 'თემის შეცვლა (დღე/ღამე)',
    navAria: 'გაკვეთილები',
    navItems: [
      { num: '1', title: 'პირველი მიწოდება', href: '01-ka.html' },
      { num: '2', title: 'მოთხოვნები: რას ნიშნავს «მზადაა»', href: '02-ka.html' },
      { num: '3', title: 'ცვლილებების ისტორია', later: true },
      { num: '4', title: 'საკუთარი შემოწმება', later: true },
      { num: '5', title: 'შემოწმება შენ გარეშე', later: true },
      { num: '6', title: 'როცა ფუჭდება', later: true },
      { num: '7', title: 'მწვანე, რომელიც არაფერს ნიშნავს', later: true },
      { num: '8', title: 'მიწოდება: ჩვენება და დაცვა', later: true }
    ],
    glossaryNav: '📖 ტერმინთა ლექსიკონი',
    footer: 'საიტი შექმნილია იმავე ხელსაწყოებით, რაც მონაწილეებს აქვთ: სუფთა HTML და CSS, შემოწმება bash-ზე, გამოქვეყნება GitHub Pages-ის საშუალებით.',
    pages: {
      index: {
        title: 'AI Bootcamp · რვა გაკვეთილისგან შემდგარი კურსი',
        h1: 'რვა გაკვეთილი და თითოეულზე შენ რაღაცას აბარებ',
        lead: 'კურსი იმის შესახებ, თუ როგორ ვიმუშაოთ ხელოვნურ ინტელექტთან ისე, რომ მივიღოთ რეალური პროდუქტი და არა უბრალო საუბარი. შენ წერ დავალებას, AI აკეთებს, შემოწმება პასუხობს «კი» ან «არა». რვაჯერ.',
        stubH2: 'კურსის მასალები დაგეგმილია მომავალში თარგმნისთვის',
        stubP1: 'საიტის სრული სამუშაო ვერსია ნაბიჯ-ნაბიჯ გაკვეთილებით, ტერმინალის ბრძანებებით და შემოწმების სკრიპტებით ამჟამად გამოქვეყნებულია და მხარდაჭერილია на русском языке.',
        stubP2: 'შეგიძლიათ გაეცნოთ საიტის სრულ ვერსიას და დაიწყოთ სწავლა:',
        btnText: 'მთავარი გვერდის გახსნა на русском языке →',
        btnHref: 'index.html'
      },
      '01': {
        title: 'გაკვეთილი 1 · პირველი მიწოდება · AI Bootcamp',
        h1: 'გაკვეთილი 1 · პირველი მიწოდება',
        lead: 'გაკვეთილის ბოლოს გექნება ინტერნეტ მისამართი, რომლის გაგზავნაც შეგიძლია მეგობრისთვის, და ამ მისამართზე გვერდი შექმნილია AI-ს მიერ — შენი დავალებით და არა მისი ვარაუდით.',
        stubH2: 'გაკვეთილის მასალები დაგეგმილია მომავალში თარგმნისთვის',
        stubP1: 'გაკვეთილის სრული სამუშაო ვერსია ნაბიჯ-ნაბიჯ ინსტრუქციებით, ტერმინალის ბრძანებებით და შემოწმების სკრიპტებით ამჟამად ხელმისაწვდომია на русском языке.',
        stubP2: 'შეგიძლიათ გაიაროთ გაკვეთილი სრული ორიგინალი ვერსიით:',
        btnText: 'გაკვეთილი 1-ის გახსნა на русском языке →',
        btnHref: '01.html'
      },
      '02': {
        title: 'გაკვეთილი 2 · მოთხოვნები: რას ნიშნავს «მზადაა» · AI Bootcamp',
        h1: 'გაკვეთილი 2 · მოთხოვნები: რას ნიშნავს «მზადაა»',
        lead: 'AI ქმნის კოდს, მაგრამ არ იცის, როდის უნდა გაჩერდეს. თუ მიღების კრიტერიუმი არ არსებობს — ის უსასრულოდ გამოიგონებს. ვსწავლობთ ისეთი პირობების დაწერას, რომელთა ავტომატურად შემოწმებაც შესაძლებელია.',
        stubH2: 'გაკვეთილის მასალები დაგეგმილია მომავალში თარგმნისთვის',
        stubP1: 'გაკვეთილის სრული სამუშაო ვერსია რთული პრედიკატების პრაქტიკით, საკუთარი სკილით და შემოწმების ტესტებით ამჟამად ხელმისაწვდომია на русском языке.',
        stubP2: 'შეგიძლიათ გაიაროთ გაკვეთილი სრული ორიგინალი ვერსიით:',
        btnText: 'გაკვეთილი 2-ის გახსნა на русском языке →',
        btnHref: '02.html'
      },
      glossary: {
        title: 'ტერმინთა ლექსიკონი · AI Bootcamp',
        h1: 'კურსის ტერმინთა ლექსიკონი',
        lead: 'ჩვენ ვასწავლით ზრდასრულთა საინჟინრო ხელობას, ამიტომ საგნებს თავის სახელებს ვარქმევთ. მაგრამ თითოეული სიტყვა აქ არ არის საგამოცდო ბილეთი, არამედ ძალის იარაღია, რომელიც კონკრეტულ ამოცანას წყვეტს.',
        stubH2: 'ტერმინთა ლექსიკონი დაგეგმილია მომავალში თარგმნისთვის',
        stubP1: 'ტერმინების სრული ლექსიკონი დეტალური განმარტებებით და გაკვეთილების კონტექსტური ბმულებით ამჟამად ხელმისაწვდომია на русском языке.',
        stubP2: 'შეგიძლიათ იხილოთ სრული ლექსიკონი ორიგინალში:',
        btnText: 'ტერმინთა ლექსიკონის გახсნა на русском языке →',
        btnHref: 'glossary.html'
      }
    }
  }
};

// 1. Update existing 16 files with the 8-language switcher
const existingFiles = [
  'index.html', '01.html', '02.html', 'glossary.html',
  'index-uk.html', '01-uk.html', '02-uk.html', 'glossary-uk.html',
  'index-en.html', '01-en.html', '02-en.html', 'glossary-en.html',
  'index-de.html', '01-de.html', '02-de.html', 'glossary-de.html'
];

for (const filename of existingFiles) {
  const filePath = path.join(siteDir, filename);
  if (!fs.existsSync(filePath)) continue;

  let content = fs.readFileSync(filePath, 'utf8');

  // Determine track and langCode
  let track = 'index';
  if (filename.startsWith('01')) track = '01';
  else if (filename.startsWith('02')) track = '02';
  else if (filename.startsWith('glossary')) track = 'glossary';

  let langCode = 'ru';
  if (filename.includes('-uk.')) langCode = 'uk';
  else if (filename.includes('-en.')) langCode = 'en';
  else if (filename.includes('-de.')) langCode = 'de';

  const langObj = LANGUAGES.find(l => l.code === langCode);
  const newSwitcher = renderLangSwitcher(track, langCode, langObj.ariaLabel);

  // Replace <div class="lang-switcher" ...>...</div>
  const switcherRegex = /<div class="lang-switcher"[^>]*>[\s\S]*?<\/div>/;
  if (switcherRegex.test(content)) {
    content = content.replace(switcherRegex, newSwitcher.trim());
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated lang switcher in: ${filename}`);
  } else {
    console.warn(`Could not find lang-switcher in: ${filename}`);
  }
}

// 2. Generate new 16 stub files for be, kk, ky, ka
for (const [langKey, langInfo] of Object.entries(STUB_DATA)) {
  for (const track of TRACKS) {
    const filename = `${track}-${langKey}.html`;
    const pageData = langInfo.pages[track];

    let navListHtml = '';
    langInfo.navItems.forEach(item => {
      const isCurrent = item.href === filename;
      const ariaAttr = isCurrent ? ' aria-current="page"' : '';
      if (item.later) {
        navListHtml += `      <li><span class="later"><span class="num">${item.num}</span>${item.title}</span></li>\n`;
      } else {
        navListHtml += `      <li><a href="${item.href}"${ariaAttr}><span class="num">${item.num}</span>${item.title}</a></li>\n`;
      }
    });

    const isGlossaryPage = track === 'glossary';
    const glossaryCurrent = isGlossaryPage ? ' aria-current="page"' : '';
    const homeHref = `./index-${langKey}.html`;

    const switcherHtml = renderLangSwitcher(track, langKey, langInfo.switcherAria);

    const fileContent = `<!doctype html>
<html lang="${langInfo.lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${pageData.title}</title>
<link rel="stylesheet" href="style.css?v=6">
<script>
  (function() {
    var t = localStorage.getItem('b1-theme');
    if (t) document.documentElement.setAttribute('data-theme', t);
    var f = localStorage.getItem('b1-font');
    if (f) document.documentElement.setAttribute('data-font', f);
  })();
</script>
</head>
<body>
<div class="wrap">

<header class="top">
  <div class="brand-group">
    <a class="home" href="${homeHref}">
      <span class="badge-ai">ai|</span>
      <span class="sub-brand">${langInfo.subBrand}</span>
    </a>
    <div class="three" aria-hidden="true">${langInfo.three}</div>
  </div>
  <div class="utility-tray" role="toolbar" aria-label="${langInfo.trayAria}">
${switcherHtml}
    <div class="font-scaler" role="group" aria-label="${langInfo.fontAria}">
      <button type="button" class="font-btn font-s" data-size="s" title="${langInfo.fontS}" aria-label="${langInfo.fontS}">А</button>
      <button type="button" class="font-btn font-m active" data-size="m" title="${langInfo.fontM}" aria-label="${langInfo.fontM}">A</button>
      <button type="button" class="font-btn font-l" data-size="l" title="${langInfo.fontL}" aria-label="${langInfo.fontL}">A</button>
    </div>
    <button type="button" class="theme-toggle" id="themeToggle" title="${langInfo.themeAria}" aria-label="${langInfo.themeAria}">
      <span class="theme-icon" aria-hidden="true">☼</span>
    </button>
  </div>
</header>

<div class="cols">

  <nav class="sessions" aria-label="${langInfo.navAria}">
    <ol>
${navListHtml}    </ol>
    <div class="nav-extra">
      <a href="glossary-${langKey}.html"${glossaryCurrent}>${langInfo.glossaryNav}</a>
    </div>
  </nav>

  <main>
    <h1>${pageData.h1}</h1>
    <p class="lead">${pageData.lead}</p>

    <div class="stub-card">
      <h2>${pageData.stubH2}</h2>
      <p>${pageData.stubP1}</p>
      <p>${pageData.stubP2}</p>
      <div class="stub-actions">
        <a href="${pageData.btnHref}" class="btn-primary">${pageData.btnText}</a>
      </div>
    </div>

    <footer>
      ${langInfo.footer}
    </footer>
  </main>

</div>
</div>
<script src="swa.js"></script>
</body>
</html>
`;

    const outPath = path.join(siteDir, filename);
    fs.writeFileSync(outPath, fileContent, 'utf8');
    console.log(`Created stub file: ${filename}`);
  }
}

console.log('Multilingual stubs generation completed successfully.');
