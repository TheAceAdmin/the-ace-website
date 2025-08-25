import React, { useMemo, useRef, useState, useEffect } from "react";

/**
 * Single‑file React app: Fill membership form ➜ Print (no forced PDF download)
 *
 * What's included
 * - Left panel: form inputs (data entry + options)
 * - Right panel: live preview designed for clean A4 printing
 * - "Print filled form" triggers window.print()
 * - Signature input: draw on a canvas or type your name (drawn takes precedence)
 * - Optional Association sign box (toggle)
 * - Smoke tests panel to verify key UI pieces exist (no external test libs)
 *
 * Notes
 * - Buttons/controls are hidden in print via @media print
 * - Plain React/JSX (no TS types) to avoid build issues
 */

export default function App() {
  const [data, setData] = useState({
    applicantTitle: "Shri",
    applicantName: "",
    age: "",
    occupation: "",
    flatNo: "",
    block: "",
    areaSqft: "",
    buildingName: "The ACE",
    addressLine: "1, Corporation Road, Chennai",
    owners: [{ name: "", details: "", location: "", memberInJoint: "" }],
    admissionFee: "1000",
    place: "",
    date: new Date().toISOString().slice(0, 10),
    mobile: "",
    email: "",
    jointUndertaking: "",
    // NEW: signature fields
    typedSignature: "",
    signatureDataUrl: "",
  });

  const [showAssociationSignBox, setShowAssociationSignBox] = useState(false);
  const photoInputRef = useRef(null);
  const [photoUrl, setPhotoUrl] = useState("");

  // --- Signature Pad refs/state
  const canvasRef = useRef(null);
  const isDrawingRef = useRef(false);
  const lastPointRef = useRef({ x: 0, y: 0 });

  function update(key, value) {
    setData((d) => ({ ...d, [key]: value }));
  }

  function setOwner(idx, key, value) {
    setData((d) => {
      const owners = d.owners.slice();
      owners[idx] = { ...owners[idx], [key]: value };
      return { ...d, owners };
    });
  }

  function addOwnerRow() {
    setData((d) => ({ ...d, owners: [...d.owners, { name: "", details: "", location: "", memberInJoint: "" }] }));
  }

  function removeOwnerRow(i) {
    setData((d) => ({ ...d, owners: d.owners.filter((_, idx) => idx !== i) }));
  }

  function onSelectPhoto(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPhotoUrl(url);
  }

  function handlePrint() {
    window.print();
  }

  // Signature pad helpers (mouse & touch via pointer events if available)
  function getCanvasPoint(evt) {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const cx = (evt.clientX ?? (evt.touches && evt.touches[0]?.clientX)) - rect.left;
    const cy = (evt.clientY ?? (evt.touches && evt.touches[0]?.clientY)) - rect.top;
    return { x: cx, y: cy };
  }
  function startDraw(evt) {
    if (!canvasRef.current) return;
    isDrawingRef.current = true;
    const p = getCanvasPoint(evt);
    lastPointRef.current = p;
  }
  function moveDraw(evt) {
    if (!isDrawingRef.current || !canvasRef.current) return;
    evt.preventDefault();
    const ctx = canvasRef.current.getContext("2d");
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.strokeStyle = "#111";
    const p = getCanvasPoint(evt);
    ctx.beginPath();
    ctx.moveTo(lastPointRef.current.x, lastPointRef.current.y);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
    lastPointRef.current = p;
  }
  function endDraw() {
    if (!canvasRef.current) return;
    isDrawingRef.current = false;
    // store data URL automatically after each stroke
    const url = canvasRef.current.toDataURL("image/png");
    update("signatureDataUrl", url);
  }
  function clearSignature() {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext("2d");
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    update("signatureDataUrl", "");
  }

  // ----- very simple smoke tests (no external libs) -----
  const [testResults, setTestResults] = useState([]);
  useEffect(() => {
    const results = [];
    results.push({ name: "Print button exists", pass: !!document.querySelector('[data-testid="print-button"]') });
    results.push({ name: "Printable container exists", pass: !!document.getElementById("printable") });
    results.push({ name: "Applicant signature area visible", pass: !!document.querySelector('[data-testid="signature-applicant"]') });
    const assocVisible = !!document.querySelector('[data-testid="signature-association"]');
    results.push({ name: "Association signature default hidden", pass: !assocVisible });
    setTestResults(results);
  }, []);

  return (
    <div className="min-h-screen w-full bg-neutral-100 text-neutral-900">
      {/* Header */}
      <div className="print:hidden sticky top-0 z-10 border-b bg-white/90 backdrop-blur">
        <div className="mx-auto max-w-6xl px-4 py-3 flex flex-wrap items-center gap-2 justify-between">
          <h1 className="text-xl font-semibold tracking-tight">Membership Form – The Ace Apartment Owners Welfare Association (TAAOWA)</h1>
          <div className="flex gap-2">
            <button data-testid="print-button" onClick={handlePrint} className="rounded-2xl px-4 py-2 bg-black text-white shadow hover:shadow-md active:scale-[.99]">Print filled form</button>
          </div>
        </div>
      </div>

      {/* Main layout */}
      <div className="mx-auto max-w-6xl grid lg:grid-cols-2 gap-6 p-4">
        {/* Form column */}
        <section className="print:hidden">
          <div className="rounded-2xl bg-white p-4 shadow-sm">
            <h2 className="text-lg font-semibold">Applicant details</h2>
            <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="text-sm font-medium">Title</label>
                <select value={data.applicantTitle} onChange={(e) => update("applicantTitle", e.target.value)} className="mt-1 w-full rounded-xl border p-2">
                  <option>Shri</option>
                  <option>Smt</option>
                  <option>Ms</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="text-sm font-medium">Full name</label>
                <input value={data.applicantName} onChange={(e) => update("applicantName", e.target.value)} className="mt-1 w-full rounded-xl border p-2" placeholder="Your name" />
              </div>
              <div>
                <label className="text-sm font-medium">Age</label>
                <input value={data.age} onChange={(e) => update("age", e.target.value)} className="mt-1 w-full rounded-xl border p-2" placeholder="Years" />
              </div>
              <div className="md:col-span-2">
                <label className="text-sm font-medium">Occupation</label>
                <input value={data.occupation} onChange={(e) => update("occupation", e.target.value)} className="mt-1 w-full rounded-xl border p-2" placeholder="e.g., Engineer" />
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="text-sm font-medium">Flat No</label>
                <input value={data.flatNo} onChange={(e) => update("flatNo", e.target.value)} className="mt-1 w-full rounded-xl border p-2" placeholder="e.g., D-1206" />
              </div>
              <div>
                <label className="text-sm font-medium">Block</label>
                <input value={data.block} onChange={(e) => update("block", e.target.value)} className="mt-1 w-full rounded-xl border p-2" placeholder="e.g., D" />
              </div>
              <div>
                <label className="text-sm font-medium">Area (sq ft)</label>
                <input value={data.areaSqft} onChange={(e) => update("areaSqft", e.target.value)} className="mt-1 w-full rounded-xl border p-2" placeholder="e.g., 1222" />
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium">Mobile</label>
                <input value={data.mobile} onChange={(e) => update("mobile", e.target.value)} className="mt-1 w-full rounded-xl border p-2" placeholder="10-digit number" />
              </div>
              <div>
                <label className="text-sm font-medium">Email</label>
                <input value={data.email} onChange={(e) => update("email", e.target.value)} className="mt-1 w-full rounded-xl border p-2" placeholder="you@example.com" />
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-3">
              <div>
                <label className="text-sm font-medium">Postal address</label>
                <input value={data.addressLine} onChange={(e) => update("addressLine", e.target.value)} className="mt-1 w-full rounded-xl border p-2" />
              </div>
            </div>

            <div className="mt-6">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Owners / Joint ownership</h3>
                <button onClick={addOwnerRow} className="rounded-xl border px-3 py-1 text-sm hover:bg-neutral-50">Add row</button>
              </div>
              <div className="mt-2 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left">
                      <th className="pb-2 pr-2">Name</th>
                      <th className="pb-2 pr-2">Flat particulars</th>
                      <th className="pb-2 pr-2">Location</th>
                      <th className="pb-2 pr-2">Owner who becomes member</th>
                      <th className="pb-2"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.owners.map((o, i) => (
                      <tr key={i} className="align-top">
                        <td className="pb-2 pr-2">
                          <input className="w-full rounded-lg border p-2" value={o.name} onChange={(e) => setOwner(i, "name", e.target.value)} />
                        </td>
                        <td className="pb-2 pr-2">
                          <input className="w-full rounded-lg border p-2" value={o.details} onChange={(e) => setOwner(i, "details", e.target.value)} placeholder="e.g., 1222 sq ft, B block" />
                        </td>
                        <td className="pb-2 pr-2">
                          <input className="w-full rounded-lg border p-2" value={o.location} onChange={(e) => setOwner(i, "location", e.target.value)} />
                        </td>
                        <td className="pb-2 pr-2">
                          <input className="w-full rounded-lg border p-2" value={o.memberInJoint} onChange={(e) => setOwner(i, "memberInJoint", e.target.value)} />
                        </td>
                        <td className="pb-2">
                          {data.owners.length > 1 && (
                            <button onClick={() => removeOwnerRow(i)} className="rounded-lg border px-2 py-1 text-xs hover:bg-neutral-50">Remove</button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="text-sm font-medium">Admission fee (₹)</label>
                <input value={data.admissionFee} onChange={(e) => update("admissionFee", e.target.value)} className="mt-1 w-full rounded-xl border p-2" />
              </div>
              <div>
                <label className="text-sm font-medium">Place</label>
                <input value={data.place} onChange={(e) => update("place", e.target.value)} className="mt-1 w-full rounded-xl border p-2" />
              </div>
              <div>
                <label className="text-sm font-medium">Date</label>
                <input type="date" value={data.date} onChange={(e) => update("date", e.target.value)} className="mt-1 w-full rounded-xl border p-2" />
              </div>
            </div>

            <div className="mt-6">
              <label className="text-sm font-medium">Upload photo (optional)</label>
              <input ref={photoInputRef} type="file" accept="image/*" onChange={onSelectPhoto} className="mt-1 block w-full text-sm" />
            </div>

            <div className="mt-6">
              <label className="text-sm font-medium">Joint ownership undertaking (optional)</label>
              <textarea value={data.jointUndertaking} onChange={(e) => update("jointUndertaking", e.target.value)} className="mt-1 w-full rounded-xl border p-2 min-h-24" placeholder="If applicable, paste undertaking text here" />
            </div>

            <div className="mt-6 flex items-center gap-3">
              <input id="toggle-assoc" type="checkbox" checked={showAssociationSignBox} onChange={(e) => setShowAssociationSignBox(e.target.checked)} />
              <label htmlFor="toggle-assoc" className="text-sm">Show association official signature box</label>
            </div>

            {/* Signature input (draw or type) */}
            <div className="mt-8">
              <h3 className="font-semibold mb-2">Signature (input box)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Drawn signature */}
                <div>
                  <div className="text-sm mb-1">Draw your signature</div>
                  <div className="border rounded-xl p-3">
                    <canvas
                      ref={canvasRef}
                      width={520}
                      height={160}
                      className="w-full h-40 bg-white rounded-lg border"
                      onMouseDown={startDraw}
                      onMouseMove={moveDraw}
                      onMouseUp={endDraw}
                      onMouseLeave={endDraw}
                      onTouchStart={startDraw}
                      onTouchMove={moveDraw}
                      onTouchEnd={endDraw}
                    />
                    <div className="mt-2 flex gap-2">
                      <button type="button" onClick={clearSignature} className="rounded-lg border px-3 py-1 text-sm">Clear</button>
                      <span className="text-xs text-neutral-600 self-center">Saved automatically to preview</span>
                    </div>
                  </div>
                </div>
                {/* Typed signature */}
                <div>
                  <div className="text-sm mb-1">Or type your name</div>
                  <input
                    value={data.typedSignature}
                    onChange={(e) => update("typedSignature", e.target.value)}
                    placeholder="Type full name as signature"
                    className="w-full rounded-xl border p-2"
                  />
                  <div className="mt-2 text-xs text-neutral-600">If both drawn and typed are provided, the <span className="font-medium">drawn</span> signature will be used in the print.</div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button data-testid="print-button" onClick={handlePrint} className="rounded-2xl px-4 py-2 bg-black text-white shadow hover:shadow-md active:scale-[.99]">Print filled form</button>
              <p className="text-sm text-neutral-600 self-center">This opens your browser's print dialog (choose a printer or "Save as PDF").</p>
            </div>

            {/* Dev: lightweight smoke tests */}
            <div className="mt-6 rounded-xl border bg-white p-3">
              <div className="text-sm font-semibold mb-2">Smoke tests</div>
              <ul className="space-y-1 text-sm">
                {testResults.map((t, i) => (
                  <li key={i} className={t.pass ? "text-green-700" : "text-red-700"}>
                    {t.pass ? "✓" : "✗"} {t.name}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Preview/Printable column */}
        <section>
          <div id="printable" className="rounded-2xl bg-white p-6 shadow-sm print:shadow-none print:rounded-none">
            <PrintableView data={data} photoUrl={photoUrl} showAssociationSignBox={showAssociationSignBox} />
          </div>
        </section>
      </div>

      <style>{`
        @page { size: A4; margin: 16mm; }
        @media print {
          body { background: white; }
          .print\\:hidden { display: none !important; }
          #printable { box-shadow: none !important; }
        }
      `}</style>
    </div>
  );
}

function FieldRow({ label, children }) {
  return (
    <div className="grid grid-cols-12 gap-2 items-start">
      <div className="col-span-4 md:col-span-3 text-sm font-medium text-neutral-700">{label}</div>
      <div className="col-span-8 md:col-span-9">{children}</div>
    </div>
  );
}

function LineBox({ children }) {
  return <div className="min-h-8 border-b border-dashed pb-1">{children}</div>;
}

function PrintableView({ data, photoUrl, showAssociationSignBox }) {
  const today = useMemo(() => new Date().toLocaleDateString(), []);
  const hasDrawnSignature = !!data.signatureDataUrl;
  const hasTypedSignature = !!data.typedSignature?.trim();
  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="text-center">
        <div className="text-xs tracking-wide">[Under the Bye-law No. 9(c&f)]</div>
        <h2 className="mt-1 text-xl font-bold">Membership Form</h2>
        <div className="text-sm">The form of application for membership of the Association by an individual</div>
      </div>

      {/* Address / To */}
      <div>
        <div>To,</div>
        <div className="font-medium">The President / Secretary</div>
        <div>{data.buildingName} Apartment Owners Welfare Association</div>
        <div>{data.addressLine}</div>
      </div>

      {/* Salutation paragraph */}
      <div className="text-sm leading-6">
        I, {data.applicantTitle} <span className="font-medium">{data.applicantName || "__________"}</span> hereby make an application for membership of the {data.buildingName} Apartment Owners Welfare Association. My particulars for the purpose of consideration of this application are as under:
      </div>

      {/* Photo + quick lines */}
      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-9 space-y-3">
          <FieldRow label="Age">
            <LineBox>{data.age}</LineBox>
          </FieldRow>
          <FieldRow label="Occupation">
            <LineBox>{data.occupation}</LineBox>
          </FieldRow>
          <FieldRow label="Flat No / Block">
            <LineBox>
              {data.flatNo} {data.block && `• Block ${data.block}`} • {data.areaSqft && `${data.areaSqft} sq ft`}
            </LineBox>
          </FieldRow>
        </div>
        <div className="col-span-3">
          <div className="aspect-[3/4] border flex items-center justify-center text-xs text-neutral-500">
            {photoUrl ? <img src={photoUrl} alt="Applicant" className="h-full w-full object-cover" /> : "Photo"}
          </div>
        </div>
      </div>

      {/* Owners table */}
      <div>
        <div className="font-semibold">Joint ownership details</div>
        <table className="mt-2 w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="text-left py-1 pr-2">Sr. No.</th>
              <th className="text-left py-1 pr-2">Name of person(s)</th>
              <th className="text-left py-1 pr-2">Flat particulars</th>
              <th className="text-left py-1 pr-2">Location</th>
              <th className="text-left py-1">Owner who will become member (in joint ownership)</th>
            </tr>
          </thead>
          <tbody>
            {data.owners.map((o, i) => (
              <tr key={i} className="border-b last:border-b-0 align-top">
                <td className="py-1 pr-2">{i + 1}</td>
                <td className="py-1 pr-2">{o.name}</td>
                <td className="py-1 pr-2">{o.details}</td>
                <td className="py-1 pr-2">{o.location}</td>
                <td className="py-1">{o.memberInJoint}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Declarations */}
      <div className="space-y-2 text-sm leading-6">
        <p>
          I remit herewith a sum of ₹ {data.admissionFee || "_____"} (excluding tax) for admission entrance fee to the Association. I undertake to discharge all the present and future liabilities to the Association.
        </p>
        <p>
          I undertake to use the flat for the purpose for which it is purchased by me/us and that any change of use like renting it out will be made with intimation to the Association. I agree that the rules of the Association will be followed by me.
        </p>
        <p>
          I have gone through the registered Bye-law of the Association and undertake to abide by the same and any modifications from time to time.
        </p>
      </div>

      {/* Place / Date */}
      <div className="grid grid-cols-12 gap-4 mt-2">
        <div className="col-span-6">
          <FieldRow label="Place">
            <LineBox>{data.place}</LineBox>
          </FieldRow>
        </div>
        <div className="col-span-6">
          <FieldRow label="Date">
            <LineBox>{data.date || today}</LineBox>
          </FieldRow>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-4 mt-4">
        <div className="col-span-6">
          <FieldRow label="Mobile">
            <LineBox>{data.mobile}</LineBox>
          </FieldRow>
        </div>
        <div className="col-span-6">
          <FieldRow label="Email">
            <LineBox>{data.email}</LineBox>
          </FieldRow>
        </div>
      </div>

      {/* Signature Boxes */}
      <div className="grid grid-cols-12 gap-4 mt-12">
        <div className="col-span-6 flex justify-start" data-testid="signature-applicant">
          <div className="w-56 text-center">
            {/* Signature rendering preference: drawn > typed > empty line */}
            <div className="h-20 flex items-center justify-center border-b border-neutral-800">
              {hasDrawnSignature ? (
                <img src={data.signatureDataUrl} alt="Signature" className="max-h-16 object-contain" />
              ) : hasTypedSignature ? (
                <span style={{ fontFamily: 'cursive', fontSize: '1.1rem' }}>{data.typedSignature}</span>
              ) : null}
            </div>
            <div className="text-sm mt-1">(Signature of the Applicant)</div>
          </div>
        </div>
        {showAssociationSignBox && (
          <div className="col-span-6 flex justify-end" data-testid="signature-association">
            <div className="w-56 text-center">
              <div className="h-20 border-b border-neutral-800"></div>
              <div className="text-sm mt-1">(Signature with Seal – Association Official)</div>
            </div>
          </div>
        )}
      </div>

      <div className="text-sm text-neutral-600 mt-6">(For Office use) Membership No. ____________ • Receipt No. ____________</div>

      {/* Optional Undertaking */}
      {data.jointUndertaking && data.jointUndertaking.trim() && (
        <div className="mt-8 border-t pt-4">
          <div className="text-center text-xs">[Under the Bye-law No. 9(f)]</div>
          <div className="text-center font-semibold">Undertaking (Joint Ownership)</div>
          <div className="whitespace-pre-wrap text-sm mt-2 leading-6">{data.jointUndertaking}</div>
        </div>
      )}

      {/* Footer note */}
      <div className="text-[11px] text-neutral-500 mt-6">
        Note: This print-friendly layout mirrors the association's membership form format for convenience. Submit the printed copy with required enclosures as per association instructions.
      </div>
    </div>
  );
}
