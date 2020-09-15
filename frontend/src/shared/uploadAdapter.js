const axios = require("axios");
class UploadAdapter {
    constructor(loader) {
      this.loader = loader;
    }
  
    upload() {
      return this.loader.file.then(uploadedFile => {
        return UploadFile(uploadedFile);
      });
    }
    abort() {}
  }

  function UploadFile(uploadedFile, pathToSave, name){
    return new Promise((resolve, reject) => {
      const data = new FormData();
      data.append("name", name || uploadedFile.name);
      if (pathToSave) data.append("pathToSave", pathToSave);
      data.append("file", uploadedFile);
      axios({
        url: "/files/upload",
        method: "post",
        data,
        headers: {
          "Content-Type": "multipart/form-data;"
        },
        withCredentials: false
      }).then(response => {
        if (response.data.result == "success") {
          resolve({ default: response.data.url });
        } else {
          reject(response.data.message);
        }
      })
      .catch(response => {
        reject("Upload failed");
      });
    });
  }
  export {UploadAdapter, UploadFile};