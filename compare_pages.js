fetch('http://localhost:3000/api/feed?page=0&itemsPerPage=10&sort=latest')
  .then(r => r.json())
  .then(data0 => {
    console.log("Page 0 first ID:", data0[0]?._id);
    fetch('http://localhost:3000/api/feed?page=1&itemsPerPage=10&sort=latest')
      .then(r => r.json())
      .then(data1 => {
        console.log("Page 1 first ID:", data1[0]?._id);
        if (data0[0]?._id === data1[0]?._id) {
           console.log("ERROR: Page 0 and Page 1 are IDENTICAL! Skip failed!");
        } else {
           console.log("Pages are different. Something else is wrong.");
        }
      });
  });
