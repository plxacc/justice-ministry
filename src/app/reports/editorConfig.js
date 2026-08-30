// قائمة التواقيع والمصادقات المعتمدة
export const SIGNATURE_PRESETS = [
  { id: 'hajjaj', name: 'الحجاج أبو يوسف', title: 'قاضي المحكمة', img: '/sig-hajjaj.png', department: 'الدائرة القضائية الأولى' },
  { id: 'tariq', name: 'طارق المنصوري', title: 'المدعي العام', img: '/sig-tariq.png', department: 'النيابة العامة' },
  { id: 'hazzem', name: 'هزيم العلي', title: 'المدعي العام', img: '/sig-hazzem.png', department: 'فرع النيابة العامة' },
  { id: 'april', name: 'ابريل ميندوزا', title: 'وكيل النيابة', img: '/sig-april.png', department: 'فرع وكلاء النيابة' },
];

// قوالب نصوص جاهزة للاختيار السريع
export const REPORT_TEMPLATES = [
  {
    id: 'verdict',
    label: 'العنوان',
    defaultTitle: 'عنوان التقرير هنا',
    defaultContent: 'النص يكون هنا',
  },
];

// أحجام الخطوط المعتمدة
export const FONT_SIZES = [
  { label: '20%', value: '1' },
  { label: '40%', value: '2' },
  { label: '60%', value: '3' },
  { label: '80%', value: '4' },
  { label: '100%', value: '5' },
  { label: '120%', value: '6' },
];

// ستايل تمدد الخطوط بين الشاشة والتصدير
export const EDITOR_STYLES = `
  .report-content font[size="1"] { font-size: 0.85em; }
  .report-content font[size="2"] { font-size: 1em; }
  .report-content font[size="3"] { font-size: 1.25em; }
  .report-content font[size="4"] { font-size: 1.55em; }
  .report-content font[size="5"] { font-size: 1.9em; }
  .report-content font[size="6"] { font-size: 2.3em; }
  .report-content font[size="7"] { font-size: 2.8em; }
  .report-content div { margin-bottom: 0.6em; }
`;