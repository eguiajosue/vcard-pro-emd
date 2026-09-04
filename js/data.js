// Social networks for vCard section
export const SOCIAL_NETWORKS = [
  { id:'instagram', icon:'fa-instagram',  color:'#E1306C', placeholder:'https://instagram.com/usuario' },
  { id:'facebook',  icon:'fa-facebook-f', color:'#1877F2', placeholder:'https://facebook.com/usuario' },
  { id:'twitter',   icon:'fa-x-twitter',  color:'#111111', placeholder:'https://x.com/usuario' },
  { id:'linkedin',  icon:'fa-linkedin-in',color:'#0A66C2', placeholder:'https://linkedin.com/in/usuario' },
  { id:'youtube',   icon:'fa-youtube',    color:'#FF0000', placeholder:'https://youtube.com/@usuario' },
  { id:'tiktok',    icon:'fa-tiktok',     color:'#111111', placeholder:'https://tiktok.com/@usuario' },
  { id:'github',    icon:'fa-github',     color:'#333333', placeholder:'https://github.com/usuario' },
  { id:'whatsapp',  icon:'fa-whatsapp',   color:'#25D366', placeholder:'https://wa.me/52...' },
  { id:'spotify',   icon:'fa-spotify',    color:'#1DB954', placeholder:'https://open.spotify.com/user/...' },
  { id:'twitch',    icon:'fa-twitch',     color:'#9146FF', placeholder:'https://twitch.tv/usuario' },
];

// Social QR networks (richer dataset for QR-direct mode)
export const SQR_NETWORKS = [
  { id:'whatsapp-chat', name:'WhatsApp Chat', icon:'fa-brands fa-whatsapp', color:'#25D366', gradient:'linear-gradient(135deg,#25D366,#128C7E)', type:'whatsapp-chat', hint:'QR para chat directo de WhatsApp' },
  { id:'instagram',  name:'Instagram',   icon:'fa-brands fa-instagram',  color:'#E1306C', gradient:'linear-gradient(45deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888)', prefix:'instagram.com/',   urlFn: v => `https://instagram.com/${v}`,   placeholder:'tu_usuario',            hint:'Username sin @' },
  { id:'facebook',   name:'Facebook',    icon:'fa-brands fa-facebook',   color:'#1877F2', gradient:'linear-gradient(135deg,#1877F2,#0a5dc2)',  prefix:'facebook.com/',   urlFn: v => `https://facebook.com/${v}`,   placeholder:'tu.pagina',             hint:'Username de tu pagina' },
  { id:'x',          name:'X / Twitter', icon:'fa-brands fa-x-twitter',  color:'#000',    gradient:'linear-gradient(135deg,#111,#333)',         prefix:'x.com/',          urlFn: v => `https://x.com/${v}`,          placeholder:'tu_usuario',            hint:'Username sin @' },
  { id:'tiktok',     name:'TikTok',      icon:'fa-brands fa-tiktok',     color:'#010101', gradient:'linear-gradient(135deg,#010101,#EE1D52)',   prefix:'tiktok.com/@',    urlFn: v => `https://tiktok.com/@${v}`,    placeholder:'tu_usuario',            hint:'Username sin @' },
  { id:'linkedin',   name:'LinkedIn',    icon:'fa-brands fa-linkedin',   color:'#0A66C2', gradient:'linear-gradient(135deg,#0A66C2,#004182)',   prefix:'linkedin.com/in/',urlFn: v => `https://linkedin.com/in/${v}`, placeholder:'tu-nombre',             hint:'Perfil personal' },
  { id:'youtube',    name:'YouTube',     icon:'fa-brands fa-youtube',    color:'#FF0000', gradient:'linear-gradient(135deg,#FF0000,#cc0000)',   prefix:'youtube.com/@',   urlFn: v => `https://youtube.com/@${v}`,   placeholder:'tu_canal',              hint:'Handle del canal' },
  { id:'telegram',   name:'Telegram',    icon:'fa-brands fa-telegram',   color:'#229ED9', gradient:'linear-gradient(135deg,#229ED9,#1a7db5)',   prefix:'t.me/',           urlFn: v => `https://t.me/${v}`,           placeholder:'tu_usuario',            hint:'Username sin @' },
  { id:'github',     name:'GitHub',      icon:'fa-brands fa-github',     color:'#24292e', gradient:'linear-gradient(135deg,#24292e,#444d56)',   prefix:'github.com/',     urlFn: v => `https://github.com/${v}`,     placeholder:'tu_usuario',            hint:'Username de GitHub' },
  { id:'spotify',    name:'Spotify',     icon:'fa-brands fa-spotify',    color:'#1DB954', gradient:'linear-gradient(135deg,#1DB954,#158a3e)',   prefix:'',                urlFn: v => v.startsWith('http') ? v : `https://open.spotify.com/user/${v}`, placeholder:'Enlace de Spotify', hint:'Pega el enlace completo' },
  { id:'custom',     name:'URL directa', icon:'fa-solid fa-link',        color:'#ea1585', gradient:'linear-gradient(135deg,#ea1585,#c0106e)',   prefix:'',                urlFn: v => v.startsWith('http') ? v : `https://${v}`, placeholder:'https://tu-sitio.com', hint:'Cualquier URL' },
];

export const BRAND_PRESETS = ['#ea1585','#06b2e3','#45e0a8','#ccf32e','#f59e0b','#8b5cf6','#111111'];

export const PHONE_TYPES = ['Movil','Oficina','Casa','Fax','Otro'];
export const EMAIL_TYPES = ['Personal','Trabajo','Otro'];

export const PT_MAP = { Movil:'CELL,VOICE', Oficina:'WORK,VOICE', Casa:'HOME,VOICE', Fax:'FAX', Otro:'VOICE' };
export const ET_MAP = { Personal:'HOME,INTERNET', Trabajo:'WORK,INTERNET', Otro:'INTERNET' };

export const SECTION_META = {
  datos:       { icon:'fa-user',         title:'Datos Principales',   sub:'Nombre, telefono y correo del contacto' },
  trabajo:     { icon:'fa-briefcase',    title:'Trabajo y Biografia',  sub:'Empresa, puesto, web y resumen' },
  direccion:   { icon:'fa-location-dot', title:'Direccion',           sub:'Ubicacion del contacto o empresa' },
  marca:       { icon:'fa-palette',      title:'Marca del Cliente',   sub:'Logo y color de la empresa' },
  redes:       { icon:'fa-hashtag',      title:'Redes Sociales',      sub:'Perfiles en plataformas digitales' },
  'social-qr': { icon:'fa-qrcode',       title:'Perfil Social QR',    sub:'QR directo a red social o URL' },
};

export const VC_SECTIONS = ['datos','trabajo','direccion','marca','redes'];
