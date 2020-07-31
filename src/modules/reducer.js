export default function reducer(state, action) {
  switch (action.type) {
    case 'init':
      return {
        ...state,
        ...action.payload
      };
    case "data":
      return { ...state, data: action.payload };
    case "dataDir":
      return { ...state, dataDir: action.payload };
    case "page":
      return { ...state, page: action.payload };
    default:
      throw new Error();
  }
}
