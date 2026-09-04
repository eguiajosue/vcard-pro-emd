import { VC_SECTIONS } from '../data.js';

const newPhone = (type = 'Movil', value = '') => ({ id: `p_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`, type, value });
const newEmail = (type = 'Personal', value = '') => ({ id: `e_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`, type, value });

export const BLANK_FORM = () => ({
  nombre: '', apellidos: '', empresa: '', puesto: '', web: '', nota: '',
  calle: '', ciudad: '', estado: '', zip: '', pais: '',
  phones: [newPhone()],
  emails: [],
  socials: [],
  logo: null,
  brandColor: null,
});

export const initialState = {
  mode: 'vcard',
  currentSection: 'datos',
  editingId: null,
  theme: 'dark',
  errors: { nombre: false, telefonos: false },
  formVersion: 0,
  form: BLANK_FORM(),
  sqr: {
    selectedId: null,
    value: '',
    wa: { nombre: '', telefono: '', mensaje: '' },
  },
  qr: {
    hasQR: false,
    outdated: false,
    instruction: 'Escanea para guardar el contacto.',
  },
  library: [],
};

const FORM_MUTATING = new Set([
  'SET_FIELD', 'ADD_PHONE', 'UPDATE_PHONE', 'REMOVE_PHONE',
  'ADD_EMAIL', 'UPDATE_EMAIL', 'REMOVE_EMAIL',
  'ADD_SOCIAL', 'UPDATE_SOCIAL', 'REMOVE_SOCIAL',
  'SET_LOGO', 'REMOVE_LOGO', 'SET_BRAND_COLOR', 'RESET_BRAND_COLOR',
]);

function core(state, action) {
  switch (action.type) {
    case 'SET_MODE':
      return { ...state, mode: action.mode, currentSection: action.mode === 'social' ? 'social-qr' : (VC_SECTIONS.includes(state.currentSection) ? state.currentSection : 'datos') };

    case 'SET_SECTION':
      return { ...state, currentSection: action.id };

    case 'SET_FIELD':
      return { ...state, form: { ...state.form, [action.field]: action.value } };

    case 'ADD_PHONE':
      return { ...state, form: { ...state.form, phones: [...state.form.phones, newPhone()] } };
    case 'UPDATE_PHONE':
      return { ...state, form: { ...state.form, phones: state.form.phones.map(p => p.id === action.id ? { ...p, ...action.patch } : p) } };
    case 'REMOVE_PHONE': {
      const phones = state.form.phones.filter(p => p.id !== action.id);
      return { ...state, form: { ...state.form, phones: phones.length ? phones : [newPhone()] } };
    }

    case 'ADD_EMAIL':
      return { ...state, form: { ...state.form, emails: [...state.form.emails, newEmail()] } };
    case 'UPDATE_EMAIL':
      return { ...state, form: { ...state.form, emails: state.form.emails.map(e => e.id === action.id ? { ...e, ...action.patch } : e) } };
    case 'REMOVE_EMAIL':
      return { ...state, form: { ...state.form, emails: state.form.emails.filter(e => e.id !== action.id) } };

    case 'ADD_SOCIAL':
      if (state.form.socials.some(s => s.network === action.network)) return state;
      return { ...state, form: { ...state.form, socials: [...state.form.socials, { network: action.network, value: '' }] } };
    case 'UPDATE_SOCIAL':
      return { ...state, form: { ...state.form, socials: state.form.socials.map(s => s.network === action.network ? { ...s, value: action.value } : s) } };
    case 'REMOVE_SOCIAL':
      return { ...state, form: { ...state.form, socials: state.form.socials.filter(s => s.network !== action.network) } };

    case 'SET_LOGO':
      return { ...state, form: { ...state.form, logo: action.dataUrl } };
    case 'REMOVE_LOGO':
      return { ...state, form: { ...state.form, logo: null } };
    case 'SET_BRAND_COLOR':
      return { ...state, form: { ...state.form, brandColor: action.color } };
    case 'RESET_BRAND_COLOR':
      return { ...state, form: { ...state.form, brandColor: null } };

    case 'SET_EDITING':
      return { ...state, editingId: action.id };

    case 'LOAD_CARD':
      return {
        ...state,
        editingId: action.card.id,
        currentSection: 'datos',
        form: {
          nombre: action.card.nombre || '', apellidos: action.card.apellidos || '',
          empresa: action.card.empresa || '', puesto: action.card.puesto || '',
          web: action.card.web || '', nota: action.card.nota || '',
          calle: action.card.calle || '', ciudad: action.card.ciudad || '',
          estado: action.card.estado || '', zip: action.card.zip || '', pais: action.card.pais || '',
          phones: action.card.phones?.length ? action.card.phones.map(p => newPhone(p.type, p.value)) : [newPhone()],
          emails: (action.card.emails || []).map(e => newEmail(e.type, e.value)),
          socials: (action.card.socials || []).map(s => ({ network: s.network, value: s.value })),
          logo: action.card.logo || null,
          brandColor: action.card.brandColor || null,
        },
        qr: { hasQR: false, outdated: false, instruction: 'Escanea para guardar el contacto.' },
        errors: { nombre: false, telefonos: false },
      };

    case 'NEW_CARD':
      return {
        ...state,
        editingId: null,
        currentSection: 'datos',
        form: BLANK_FORM(),
        qr: { hasQR: false, outdated: false, instruction: 'Escanea para guardar el contacto.' },
        errors: { nombre: false, telefonos: false },
      };

    case 'SET_LIBRARY':
      return { ...state, library: action.cards };

    case 'SET_SQR_SELECTED':
      return { ...state, sqr: { selectedId: action.id, value: '', wa: { nombre: '', telefono: '', mensaje: '' } } };
    case 'SET_SQR_VALUE':
      return { ...state, sqr: { ...state.sqr, value: action.value } };
    case 'SET_SQR_WA':
      return { ...state, sqr: { ...state.sqr, wa: { ...state.sqr.wa, ...action.patch } } };

    case 'SET_QR':
      return { ...state, qr: { ...state.qr, ...action.patch } };

    case 'SET_THEME':
      return { ...state, theme: action.theme };

    case 'SET_ERRORS':
      return { ...state, errors: { ...state.errors, ...action.errors } };

    default:
      return state;
  }
}

export function reducer(state, action) {
  let next = core(state, action);
  if (FORM_MUTATING.has(action.type)) {
    if (next.errors.nombre || next.errors.telefonos) next = { ...next, errors: { nombre: false, telefonos: false } };
    if (next.qr.hasQR && !next.qr.outdated) next = { ...next, qr: { ...next.qr, outdated: true } };
    next = { ...next, formVersion: next.formVersion + 1 };
  }
  return next;
}
