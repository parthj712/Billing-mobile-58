export const getLineWidth = (paperWidth) => {
    return paperWidth === "80" ? 48 : 32;
};


export const line = (width) => "-".repeat(width) + "\n";


export const alignCenter = () => "\x1B\x61\x01";
export const alignLeft = () => "\x1B\x61\x00";
export const alignRight = () => "\x1B\x61\x02";


export const boldOn = () => "\x1B\x45\x01";
export const boldOff = () => "\x1B\x45\x00";

export const doubleText = () => "\x1B\x21\x30"; // big text
export const normalText = () => "\x1B\x21\x00";



export const formatRow = (left, right, width) => {
    const space = width - left.length - right.length;
    return left + " ".repeat(space > 0 ? space : 1) + right + "\n";
};



export const wrapText = (text, width) => {
    const words = text.split(" ");
    let lines = [];
    let current = "";

    words.forEach(word => {
        if ((current + word).length > width) {
            lines.push(current.trim());
            current = word + " ";
        } else {
            current += word + " ";
        }
    });

    if (current) lines.push(current.trim());

    return lines.join("\n") + "\n";
};




export const qrCommand = (data) => {
    const store_len = data.length + 3;
    const pL = store_len % 256;
    const pH = Math.floor(store_len / 256);

    return (
        "\x1D\x28\x6B\x04\x00\x31\x41\x32\x00" + // select model
        "\x1D\x28\x6B\x03\x00\x31\x43\x06" +     // size
        "\x1D\x28\x6B\x03\x00\x31\x45\x30" +     // error correction
        "\x1D\x28\x6B" +
        String.fromCharCode(pL, pH) +
        "\x31\x50\x30" +
        data +
        "\x1D\x28\x6B\x03\x00\x31\x51\x30"
    );
};