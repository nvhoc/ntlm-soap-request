#TOUSE

ntlm = require('ntlm-soap-request-by-xml)';
ntlm.request({
    url:'url_of_your_server.com',
    SOAPAction:'your_soap_action_here',
    filePath:'url_file_xml_here'
  },function(err,err){
    // do your function here
  });