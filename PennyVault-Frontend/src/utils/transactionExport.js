const EXPORT_COLUMNS = [
  { header: "Transaction Date", key: "date", type: "text" },
  { header: "Description", key: "description", type: "text" },
  { header: "Account", key: "account", type: "text" },
  { header: "Category", key: "category", type: "text" },
  { header: "Subcategory", key: "subcategory", type: "text" },
  { header: "Type", key: "type", type: "text" },
  { header: "Amount", key: "amount", type: "number" },
];

const escapeCsvValue = (value) => {
  const rawText = value == null ? "" : String(value);
  // Prevent spreadsheet formula injection from user-entered text fields.
  const text = /^[=+@\t\r-]/.test(rawText) ? "'" + rawText : rawText;
  return /[",\r\n]/.test(text) ? '"' + text.replace(/"/g, '""') + '"' : text;
};

const escapeXml = (value) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

const columnName = (index) => {
  let name = "";
  let number = index + 1;
  while (number > 0) {
    const remainder = (number - 1) % 26;
    name = String.fromCharCode(65 + remainder) + name;
    number = Math.floor((number - 1) / 26);
  }
  return name;
};

const crc32 = (bytes) => {
  let crc = -1;
  for (let i = 0; i < bytes.length; i += 1) {
    crc ^= bytes[i];
    for (let bit = 0; bit < 8; bit += 1) {
      crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
    }
  }
  return (crc ^ -1) >>> 0;
};

const writeUint16 = (view, offset, value) => view.setUint16(offset, value, true);
const writeUint32 = (view, offset, value) => view.setUint32(offset, value >>> 0, true);

const createZipBlob = (files) => {
  const encoder = new TextEncoder();
  const localParts = [];
  const centralParts = [];
  let localOffset = 0;

  files.forEach(({ name, content }) => {
    const fileName = encoder.encode(name);
    const data = encoder.encode(content);
    const checksum = crc32(data);
    const localHeader = new Uint8Array(30 + fileName.length);
    const localView = new DataView(localHeader.buffer);

    writeUint32(localView, 0, 0x04034b50);
    writeUint16(localView, 4, 20);
    writeUint16(localView, 6, 0x0800);
    writeUint16(localView, 8, 0);
    writeUint32(localView, 14, checksum);
    writeUint32(localView, 18, data.length);
    writeUint32(localView, 22, data.length);
    writeUint16(localView, 26, fileName.length);
    writeUint16(localView, 28, 0);
    localHeader.set(fileName, 30);

    localParts.push(localHeader, data);

    const centralHeader = new Uint8Array(46 + fileName.length);
    const centralView = new DataView(centralHeader.buffer);
    writeUint32(centralView, 0, 0x02014b50);
    writeUint16(centralView, 4, 20);
    writeUint16(centralView, 6, 20);
    writeUint16(centralView, 8, 0x0800);
    writeUint16(centralView, 10, 0);
    writeUint32(centralView, 16, checksum);
    writeUint32(centralView, 20, data.length);
    writeUint32(centralView, 24, data.length);
    writeUint16(centralView, 28, fileName.length);
    writeUint16(centralView, 30, 0);
    writeUint16(centralView, 32, 0);
    writeUint16(centralView, 34, 0);
    writeUint16(centralView, 36, 0);
    writeUint32(centralView, 38, 0);
    writeUint32(centralView, 42, localOffset);
    centralHeader.set(fileName, 46);
    centralParts.push(centralHeader);

    localOffset += localHeader.length + data.length;
  });

  const centralSize = centralParts.reduce((total, part) => total + part.length, 0);
  const endRecord = new Uint8Array(22);
  const endView = new DataView(endRecord.buffer);
  writeUint32(endView, 0, 0x06054b50);
  writeUint16(endView, 4, 0);
  writeUint16(endView, 6, 0);
  writeUint16(endView, 8, files.length);
  writeUint16(endView, 10, files.length);
  writeUint32(endView, 12, centralSize);
  writeUint32(endView, 16, localOffset);
  writeUint16(endView, 20, 0);

  return new Blob([...localParts, ...centralParts, endRecord], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
};

const downloadBlob = (blob, filename) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.style.display = "none";
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
};

const buildExportRows = (transactions, accounts = []) =>
  transactions.map((transaction) => {
    const matchedAccount = accounts.find(
      (account) => String(account.id) === String(transaction.accountId),
    );
    return {
      date: transaction.date || "",
      description: transaction.description || "",
      account:
        transaction.accountName ||
        transaction.account ||
        matchedAccount?.accountName ||
        matchedAccount?.name ||
        "",
      category: transaction.category || "",
      subcategory: transaction.subcategory || "",
      type: transaction.type || "",
      amount: Number.isFinite(Number(transaction.amount))
        ? Number(transaction.amount)
        : "",
    };
  });

export const exportTransactionsCsv = (transactions, accounts = [], filename) => {
  const rows = buildExportRows(transactions, accounts);
  const csv = [
    EXPORT_COLUMNS.map((column) => escapeCsvValue(column.header)).join(","),
    ...rows.map((row) =>
      EXPORT_COLUMNS.map((column) => escapeCsvValue(row[column.key])).join(","),
    ),
  ].join("\r\n");
  downloadBlob(new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8;" }), filename);
};

export const exportTransactionsXlsx = (transactions, accounts = [], filename) => {
  const rows = buildExportRows(transactions, accounts);
  const worksheetRows = [EXPORT_COLUMNS.map((column) => column.header), ...rows.map((row) =>
    EXPORT_COLUMNS.map((column) => row[column.key]),
  )];

  const sheetData = worksheetRows.map((row, rowIndex) => {
    const cells = row.map((value, columnIndex) => {
      const reference = `${columnName(columnIndex)}${rowIndex + 1}`;
      const column = EXPORT_COLUMNS[columnIndex];
      if (rowIndex > 0 && column.type === "number" && value !== "") {
        return `<c r="${reference}"><v>${value}</v></c>`;
      }
      return `<c r="${reference}" t="inlineStr"><is><t xml:space="preserve">${escapeXml(value)}</t></is></c>`;
    }).join("");
    return `<row r="${rowIndex + 1}">${cells}</row>`;
  }).join("");

  const files = [
    {
      name: "[Content_Types].xml",
      content: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
        '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">' +
        '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>' +
        '<Default Extension="xml" ContentType="application/xml"/>' +
        '<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>' +
        '<Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>' +
        '</Types>',
    },
    {
      name: "_rels/.rels",
      content: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
        '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
        '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>' +
        '</Relationships>',
    },
    {
      name: "xl/workbook.xml",
      content: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
        '<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">' +
        '<sheets><sheet name="Transactions" sheetId="1" r:id="rId1"/></sheets></workbook>',
    },
    {
      name: "xl/_rels/workbook.xml.rels",
      content: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
        '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
        '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>' +
        '</Relationships>',
    },
    {
      name: "xl/worksheets/sheet1.xml",
      content: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
        '<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">' +
        `<sheetData>${sheetData}</sheetData></worksheet>`,
    },
  ];

  downloadBlob(createZipBlob(files), filename);
};
