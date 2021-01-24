const API_KEY = "b5d8806ecc9fea790f994448baa24b15";
const state = "GA";

const bills = [];
let billCount = 0;

$(window).on("load", () => {
  // Get Relevant Searches
  $.ajax({
    url: `https://api.legiscan.com/?key=${API_KEY}&op=search&state=${state}`,
    method: "GET",
  }).then((response) => {
    getBills(Object.values(response.searchresult));
  });

  // Get Specific Bill Info
  const getBills = (searches) => {
    for (let i = 0; i < searches.length - 1; i++) {
      $.ajax({
        url: `https://api.legiscan.com/?key=${API_KEY}&op=getBill&id=${searches[i].bill_id}`,
        method: "GET",
      }).then((response) => {
        appendToFeed(response.bill);
      });
    }
  };

  // Display Bills In Feed
  const appendToFeed = (bill) => {
    bills.push(bill);
    const status = decodeBillStatus(bill.status);

    $("nav").append(
      `<div class="nav-card" data-bill-index="${billCount}">
        <div class="space-between">
          <h2>${bill.bill_number}</h2>
          <span class="${status}">${status}</span>
        </div>
        <p>${bill.title}</p>
      </div>`
    );

    billCount++;
  };

  // Write Bill Info To Content
  const writeToContent = (billIndex) => {
    const bill = bills[billIndex];
    $("section").empty();
    $("section").append(
      `<div class="section-header">
        <h1>${bill.bill_number}</h1>
        <div data-has-voted="false">
          <span style="color: #17191b; margin-right: 10px;">
            <i class="far fa-thumbs-up fa-3x" data-vote="yea"></i>
          </span>
          <span style="color: #17191b">
            <i class="far fa-thumbs-down fa-3x fa-flip-horizontal" data-vote="nay"></i>
          </span>
        </div>
      </div>
      <p>${bill.description}</p>`
    );

    bill.sponsors.forEach((sponsor) => {
      $("section").append(
        `<span class="sponsor">${sponsor.role} ${sponsor.name}</span>`
      );
    });

    for (let i = bill.history.length - 1; i > -1; i--) {
      $("section").append(
        `<div class="progress"> 
        <span class="date">${bill.history[i].date}</span>
        <span class="action"> ${bill.history[i].action} </span> 
        </div>`
      );
    }
  };

  // Convert Status Number To String
  const decodeBillStatus = (statusNum) => {
    switch (statusNum) {
      case 1:
        return "Introduced";
      case 2:
        return "Engrossed";
      case 3:
        return "Enrolled";
      case 4:
        return "Passed";
      case 5:
        return "Vetoed";
      case 6:
        return "failed";
    }
  };

  // Handle Nav Click
  $("nav").on("click", "div", function () {
    if (this.dataset.billIndex) {
      $("nav").children().removeClass("selected");
      $(this).addClass("selected");
      writeToContent(this.dataset.billIndex);
    }
  });

  // Handle Section Click
  $("section").on("click", "i", function () {
    if (this.dataset.vote) {
      console.log(this.dataset.vote);
      if (this.dataset.vote === "yea") {
        this.style.color = "#007849";
        $(".fa-thumbs-up").animate({
          "up": "+=100px",
        });
      } else this.style.color = "#a1402f";
      $(".far").prop("disabled", true);
    }
  });
});
