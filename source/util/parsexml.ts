export function parseXml(xmlStr: string) {
   if (typeof DOMParser !== "undefined") {
      return (new DOMParser()).parseFromString(xmlStr, "text/xml");
   } else if (typeof ActiveXObject !== "undefined" && new ActiveXObject("Microsoft.XMLDOM")) {
      let xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
      xmlDoc.async = "false";
      xmlDoc.loadXML(xmlStr);
      return xmlDoc;
   } else {
      return null;
   }
}
