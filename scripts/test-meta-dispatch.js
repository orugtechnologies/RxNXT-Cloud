const fs = require('fs');
const path = require('path');

// Read .env.local manually
const envPath = path.resolve(__dirname, '../.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
  if (match) {
    let value = (match[2] || '').trim();
    if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
    env[match[1]] = value;
  }
});

const phoneNumberId = env.META_WA_PHONE_NUMBER_ID;
const accessToken = env.META_WA_ACCESS_TOKEN;
const toPhone = process.argv[2] || '919966773614';

console.log('--- Meta WhatsApp Cloud API Test ---');
console.log('Phone Number ID:', phoneNumberId);
console.log('Target Phone:', toPhone);
console.log('Access Token (prefix):', accessToken ? accessToken.substring(0, 25) + '...' : 'NONE');
console.log('Access Token Exact Length:', accessToken ? accessToken.length : 0);


async function testDispatch() {
  const endpoint = `https://graph.facebook.com/v20.0/${phoneNumberId}/messages`;

  try {
    console.log('\n[1] Testing Meta Media Upload API with PDF Buffer...');

  
  // Minimal valid 1-page PDF in base64
  const minimalPdfBase64 = 'JVBERi0xLjQKJeLjz9MKMSAwIG9iajw8L1R5cGUvQ2F0YWxvZy9QYWdlcyAyIDAgUj4+ZW5kb2JqCjIgMCBvYmo8PC9UeXBlL1BhZ2VzL0tpZHNbMyAwIFJdL0NvdW50IDE+PmVuZG9iagozIDAgb2JqPDwvVHlwZS9QYWdlL1BhcmVudCAyIDAgUi9NZWRpYUJveFswIDAgNjEyIDc5Ml0vQ29udGVudHMgNCAwIFI+PmVuZG9iago0IDAgb2JqPDwvTGVuZ3RoIDQ0Pj5zdHJlYW0KQVQKL0YxIDI0IFRmCjEwMCA3MDAgVGROCihSeE5YVCBPZmZpY2lhbCBQcmVzY3JpcHRpb24pIFRqCkVUCmVuZHN0cmVhbQplbmRvYmoKeHJlZgowIDUKMDAwMDAwMDAwMCA2NTUzNSBmIAowMDAwMDAwMDE1IDAwMDAwIG4gCjAwMDAwMDAwNjggMDAwMDAgbiAKMDAwMDAwMDEyNSAwMDAwMCBuIAowMDAwMDAwMjEzIDAwMDAwIG4gCnRyYWlsZXI8PC9TaXplIDUvUm9vdCAxIDAgUj4+CnN0YXJ0eHJlZgczMDcKJSVFT0Y=';
  const pdfBuffer = Buffer.from(minimalPdfBase64, 'base64');

  // Step 1: Upload media to Meta
  const formData = new FormData();
  formData.append('messaging_product', 'whatsapp');
  formData.append('type', 'application/pdf');
  formData.append('file', new Blob([pdfBuffer], { type: 'application/pdf' }), 'RxNXT_Prescription.pdf');

  const uploadRes = await fetch(`https://graph.facebook.com/v20.0/${phoneNumberId}/media`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
    body: formData
  });

  const uploadData = await uploadRes.json();
  console.log('Upload Status:', uploadRes.status);
  console.log('Upload Response:', uploadData);

  if (!uploadData.id) {
    console.error('Media upload failed:', uploadData);
    return;
  }

  // Step 2: Send document message using media ID
  console.log('\n[2] Dispatching WhatsApp message with uploaded Media ID:', uploadData.id);
  const docMsg = {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to: toPhone.startsWith('91') ? toPhone : `91${toPhone}`,
    type: 'document',
    document: {
      id: uploadData.id,
      filename: 'RxNXT_Prescription.pdf',
      caption: '📄 *Official Prescription*\nHello SP Ram, your official prescription from Development Clinic is attached above.'
    }
  };

  const sendRes = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(docMsg)
  });

  const sendData = await sendRes.json();
  console.log('Document Send Status:', sendRes.status);
  console.log('Document Send Payload:', sendData);



  } catch (err) {
    console.error('Error during media test:', err);
  }
}




testDispatch();


