let PRINTER_TYPE = "58mm"; // default

export const setPrinterType = (type) => {
    PRINTER_TYPE = type;
};

export const getPrinterType = () => {
    return PRINTER_TYPE;
};

export const getCanvasWidth = () => {
    return PRINTER_TYPE === "80mm" ? 576 : 384;
};