var expect = require('chai').expect;
var CRUD = require('../demos/1. CRUD');
var Population = require('../demos/2. Population');
var mongoose = require('mongoose');
var MongoClient = require('mongodb').MongoClient;
var fs = require('fs');

var dbUrl = 'mongodb://localhost:27017/myproject';
before(done=> {
  /**
   * Setup Mongoose
   */

  //Connect to the db
  mongoose.connect(dbUrl);

  //Set Mongoose promises library to native promises. You can use any library you like!
  //http://mongoosejs.com/docs/promises.html
  mongoose.Promise = global.Promise;

  //Clear the database for the tests
  MongoClient.connect(dbUrl, (err, db) => {
    var Users = db.collection('users');
    var Widgets = db.collection('widgets');

    Users.removeMany({});
    Widgets.removeMany({});

    done();
  })
});

var createdUser;
var userTony;

describe('Mongoose Basics - CRUD', ()=> {
  it('should create a user', done => {
    CRUD.createUser({
      firstName: "Ryan",
      lastName: "Knell",
      username: "rknell",
      password: "abcd123",
      photoData: [
        {
          data: "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",
          extension: "jpg"
        },
        {
          data: "iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAACXBIWXMAAAsTAAALEwEAmpwYAAAKTWlDQ1BQaG90b3Nob3AgSUNDIHByb2ZpbGUAAHjanVN3WJP3Fj7f92UPVkLY8LGXbIEAIiOsCMgQWaIQkgBhhBASQMWFiApWFBURnEhVxILVCkidiOKgKLhnQYqIWotVXDjuH9yntX167+3t+9f7vOec5/zOec8PgBESJpHmomoAOVKFPDrYH49PSMTJvYACFUjgBCAQ5svCZwXFAADwA3l4fnSwP/wBr28AAgBw1S4kEsfh/4O6UCZXACCRAOAiEucLAZBSAMguVMgUAMgYALBTs2QKAJQAAGx5fEIiAKoNAOz0ST4FANipk9wXANiiHKkIAI0BAJkoRyQCQLsAYFWBUiwCwMIAoKxAIi4EwK4BgFm2MkcCgL0FAHaOWJAPQGAAgJlCLMwAIDgCAEMeE80DIEwDoDDSv+CpX3CFuEgBAMDLlc2XS9IzFLiV0Bp38vDg4iHiwmyxQmEXKRBmCeQinJebIxNI5wNMzgwAABr50cH+OD+Q5+bk4eZm52zv9MWi/mvwbyI+IfHf/ryMAgQAEE7P79pf5eXWA3DHAbB1v2upWwDaVgBo3/ldM9sJoFoK0Hr5i3k4/EAenqFQyDwdHAoLC+0lYqG9MOOLPv8z4W/gi372/EAe/tt68ABxmkCZrcCjg/1xYW52rlKO58sEQjFu9+cj/seFf/2OKdHiNLFcLBWK8ViJuFAiTcd5uVKRRCHJleIS6X8y8R+W/QmTdw0ArIZPwE62B7XLbMB+7gECiw5Y0nYAQH7zLYwaC5EAEGc0Mnn3AACTv/mPQCsBAM2XpOMAALzoGFyolBdMxggAAESggSqwQQcMwRSswA6cwR28wBcCYQZEQAwkwDwQQgbkgBwKoRiWQRlUwDrYBLWwAxqgEZrhELTBMTgN5+ASXIHrcBcGYBiewhi8hgkEQcgIE2EhOogRYo7YIs4IF5mOBCJhSDSSgKQg6YgUUSLFyHKkAqlCapFdSCPyLXIUOY1cQPqQ28ggMor8irxHMZSBslED1AJ1QLmoHxqKxqBz0XQ0D12AlqJr0Rq0Hj2AtqKn0UvodXQAfYqOY4DRMQ5mjNlhXIyHRWCJWBomxxZj5Vg1Vo81Yx1YN3YVG8CeYe8IJAKLgBPsCF6EEMJsgpCQR1hMWEOoJewjtBK6CFcJg4Qxwicik6hPtCV6EvnEeGI6sZBYRqwm7iEeIZ4lXicOE1+TSCQOyZLkTgohJZAySQtJa0jbSC2kU6Q+0hBpnEwm65Btyd7kCLKArCCXkbeQD5BPkvvJw+S3FDrFiOJMCaIkUqSUEko1ZT/lBKWfMkKZoKpRzame1AiqiDqfWkltoHZQL1OHqRM0dZolzZsWQ8ukLaPV0JppZ2n3aC/pdLoJ3YMeRZfQl9Jr6Afp5+mD9HcMDYYNg8dIYigZaxl7GacYtxkvmUymBdOXmchUMNcyG5lnmA+Yb1VYKvYqfBWRyhKVOpVWlX6V56pUVXNVP9V5qgtUq1UPq15WfaZGVbNQ46kJ1Bar1akdVbupNq7OUndSj1DPUV+jvl/9gvpjDbKGhUaghkijVGO3xhmNIRbGMmXxWELWclYD6yxrmE1iW7L57Ex2Bfsbdi97TFNDc6pmrGaRZp3mcc0BDsax4PA52ZxKziHODc57LQMtPy2x1mqtZq1+rTfaetq+2mLtcu0W7eva73VwnUCdLJ31Om0693UJuja6UbqFutt1z+o+02PreekJ9cr1Dund0Uf1bfSj9Rfq79bv0R83MDQINpAZbDE4Y/DMkGPoa5hpuNHwhOGoEctoupHEaKPRSaMnuCbuh2fjNXgXPmasbxxirDTeZdxrPGFiaTLbpMSkxeS+Kc2Ua5pmutG003TMzMgs3KzYrMnsjjnVnGueYb7ZvNv8jYWlRZzFSos2i8eW2pZ8ywWWTZb3rJhWPlZ5VvVW16xJ1lzrLOtt1ldsUBtXmwybOpvLtqitm63Edptt3xTiFI8p0in1U27aMez87ArsmuwG7Tn2YfYl9m32zx3MHBId1jt0O3xydHXMdmxwvOuk4TTDqcSpw+lXZxtnoXOd8zUXpkuQyxKXdpcXU22niqdun3rLleUa7rrStdP1o5u7m9yt2W3U3cw9xX2r+00umxvJXcM970H08PdY4nHM452nm6fC85DnL152Xlle+70eT7OcJp7WMG3I28Rb4L3Le2A6Pj1l+s7pAz7GPgKfep+Hvqa+It89viN+1n6Zfgf8nvs7+sv9j/i/4XnyFvFOBWABwQHlAb2BGoGzA2sDHwSZBKUHNQWNBbsGLww+FUIMCQ1ZH3KTb8AX8hv5YzPcZyya0RXKCJ0VWhv6MMwmTB7WEY6GzwjfEH5vpvlM6cy2CIjgR2yIuB9pGZkX+X0UKSoyqi7qUbRTdHF09yzWrORZ+2e9jvGPqYy5O9tqtnJ2Z6xqbFJsY+ybuIC4qriBeIf4RfGXEnQTJAntieTE2MQ9ieNzAudsmjOc5JpUlnRjruXcorkX5unOy553PFk1WZB8OIWYEpeyP+WDIEJQLxhP5aduTR0T8oSbhU9FvqKNolGxt7hKPJLmnVaV9jjdO31D+miGT0Z1xjMJT1IreZEZkrkj801WRNberM/ZcdktOZSclJyjUg1plrQr1zC3KLdPZisrkw3keeZtyhuTh8r35CP5c/PbFWyFTNGjtFKuUA4WTC+oK3hbGFt4uEi9SFrUM99m/ur5IwuCFny9kLBQuLCz2Lh4WfHgIr9FuxYji1MXdy4xXVK6ZHhp8NJ9y2jLspb9UOJYUlXyannc8o5Sg9KlpUMrglc0lamUycturvRauWMVYZVkVe9ql9VbVn8qF5VfrHCsqK74sEa45uJXTl/VfPV5bdra3kq3yu3rSOuk626s91m/r0q9akHV0IbwDa0b8Y3lG19tSt50oXpq9Y7NtM3KzQM1YTXtW8y2rNvyoTaj9nqdf13LVv2tq7e+2Sba1r/dd3vzDoMdFTve75TsvLUreFdrvUV99W7S7oLdjxpiG7q/5n7duEd3T8Wej3ulewf2Re/ranRvbNyvv7+yCW1SNo0eSDpw5ZuAb9qb7Zp3tXBaKg7CQeXBJ9+mfHvjUOihzsPcw83fmX+39QjrSHkr0jq/dawto22gPaG97+iMo50dXh1Hvrf/fu8x42N1xzWPV56gnSg98fnkgpPjp2Snnp1OPz3Umdx590z8mWtdUV29Z0PPnj8XdO5Mt1/3yfPe549d8Lxw9CL3Ytslt0utPa49R35w/eFIr1tv62X3y+1XPK509E3rO9Hv03/6asDVc9f41y5dn3m978bsG7duJt0cuCW69fh29u0XdwruTNxdeo94r/y+2v3qB/oP6n+0/rFlwG3g+GDAYM/DWQ/vDgmHnv6U/9OH4dJHzEfVI0YjjY+dHx8bDRq98mTOk+GnsqcTz8p+Vv9563Or59/94vtLz1j82PAL+YvPv655qfNy76uprzrHI8cfvM55PfGm/K3O233vuO+638e9H5ko/ED+UPPR+mPHp9BP9z7nfP78L/eE8/sl0p8zAAAABGdBTUEAALGOfPtRkwAAACBjSFJNAAB6JQAAgIMAAPn/AACA6QAAdTAAAOpgAAA6mAAAF2+SX8VGAAAH+0lEQVR42uxbXWhbZRh+zhx4KTjYjM1ZdWckWAIRelHmWCKDpDR2Q0J6Yd2FrdCmMIdiraM6b7qOOifKHGTLxeqN7WAxF64kpAHxZM4tiuCBEEnZ6ainJVvBgd6Pz4v2/fqdk6Q2zc+mzQdlOd9JsvM+7/M87/t+3STGGHby2oUdvloAtABoAdACoAVAC4AWAM1ZI34/29EA9AwFnjxgGGN1/wn7fMy69/OdGLPuh30+Njn6Vsleuc836md3s4AuGgYGJ4ZNWe8ZCsAmyyUMiMzPS1aGWPeeaAlYqS4GOOL3M6+i8OBp5XW9bPCNXrsbYXTWTA9ODCMdm4NNlpHXdXQoCnJZDbmshlQ8AwDoUBQTWIMTw7h65sp/D4DNjO3qmSs8UDFw2d2GVDyD9z99B8logkuF9lVdbxgrpO2eB5TT5Yjfz2R3G1xdbthkGVfPXEHPUADJaMIkDbon0p+AocANbYXfayQANTHgu9iX7HjoXYlek66LhsEDITqTESajCQ4EZZiW+D5Xlxuff/hVWUbV0ydqAoAcPDI/L4mBAcBo/xg6FAWGtmLKqAjKaP+YKevp2BxcXW4A4KzpUBT8kv2WkUnWmw01VYGiYUB2t5XoPRlNoENRkNd17u4Eji/Ui2Q0wf3gwsx5dCgKXF1uGNoKktEEbLIM2d2G7qAHPUMBzqhGSKEmAJLRBFxdbh7c5x9+haJhoGcogLyuozvoAQCefZH6m3WGJAFfqNdUKh+7CZ77YICNfzYtWXVJ2iXak/H1DAWQy2pcBqKuu4Mebpbp2BxnB2U7l9X4NclBlIsIbC2+UDUAADD+2bREwYsuTw/m6nKXPDRJoTvoMQGSjCa4R9Dn6TtEcMS9omHwP5PRRE2mWJUJGtqKibaDE8Oc8iQHmyxzJoglrTvoQSqegS/Ui9H4WMl3E4vSsTkY2gp8oV5Tv2DtHSjrx0PvNq8KRObnpRG/n9lkmVGnJrvb+MNSNkkGROW8rvN9yigxgu6JEhLBoCX2CfUshburpT51dIMTw7xdHY2P4cLMeRQNA7msxksklTmRDWL3Rxo2tBUgtKFvAlbUeKPmhF1bpb6hreDcBwOMMkvB0XU6NseNi6RhlUEqnkEqnuFAiJUiHZszZZmCF7+DEvFYqgCZXrnMWAcXorC1FaaAU/EMN0Nqg0WTBIC/f17EX08/Ddndho8ufA3GmPTYyyD1+uTIpPu8ruPCzHnOCipxVArFlpZWd9AD7zMvY3z6ItTr13ErcXOt2fnrNwDAQGc3bN5DQPFPAMDp997DlKpKjxUAAPAqCiMNW4cesYUVS5rIGOr/zw2cAgCMT1/EtclJAMDi3Qc4cHAff304cASw7dl42OdfqDsTqgZgxO9nIl2pWcllNd7okG7pfUTxDkXBCc9rAIDDgSMoLiyYAhczvuakJcFDkqS6grBlAKgLpKMsMdvW7kw87bl65krJuHvC8xoOv/260PtagqZr4bXU2YlQKIRYLFZXALbcBxjaCvcAyrZoeOTkYg33hXpNmT9wcB9sDocps6ZgrZlfv7dcKID9+iukzs41P/B62ZSqSpIkMc+BA/xj2xmWtgxAZH5e+i72JbNmnXoCqt3Uy6fiGa59Cv4RYyXBLxcKAAA7nGWpDwB2pxPLhQKMmZkN6q4H/9yLz+KFl/Zxf6oWhKo6wXIGJwZPrMhlNa57KmuPGIP91VdKgpf7+9cYNjMDu9NZKgkCwfJZCv7+vYcAwEFo2DjsVRSW13X0DAV4oKK70yxP2bfq3jzvbgQfCoXAGIPc38/ZUHrysqfkWv3xe9y/95CDcCfxe2MBUHVdUnVdEms6UV70AXL97qAHeV3nA8ySvorlH34q+d5YLIa+vr5Njp32VATx2uQk7t97iMziIjKLizhktze2DJ72etnUF1/A29fHBx5qf8VJjiRind4+GhjYoPJmEtgscIt5FhcWsHj3AQDgRjpedbNU9ZngbCSy0bqud3pkfNbzAWp7KXirvu1OJze27QQvru0EX/WR2JSqStp680ISyGU13uqm4hne/lpnhjc//tgcpABCuf2KgVdolJp2KjylqtJpr5dZDyusJ0BiJwgA6vXrlR9cCGq5UDCXxE28oajexuLdB9vO/rYPRadUVTpktyN89CjCR4+WlEZihNgSe8noymXNtse0X7Ea1Dn4bf9egMxQ9IRUPMMPOoj+4ixAM0ClRRXiKUnCI8Y2GqQy3lBUb9ek+7r9YmS5UMD+dhdOtLswrl80HXNRA5TXdR48p3cZFlB1mP3kLMhnjvmCeEqS1oakdZAuXb5sYmLTp0Ex+8uFApb0VdxIx3HMF+TvGZ++uDZADZzC4cARePv6cG7gFNqVvRsZ3aS+i+tW4iZupOP82u1wQFtYqNvZwK5asr+kr+KPpRynY7uylwdO8/6txE18c/Zsqb7LlDKrGdLYTIC7HY66nwjtrjV4MRunvV52MhzGkr4KAPhjKYf97S7YnU4s6at8n2u7HAhl/p4b6TjcDgf2t7sAAGIpbroEKNBKOqR7RNWT4TCn/WwkwoMwyaFC4O3KXly6fNkkr3oYX80AVAPSyXDY5OazkQi0hQUc8wW5ZKyLsm7tO+plfE0BQATC7XDgjZER7gmUyX/rNdCEJTXjf4yIIBC9G0HnplaB7cwQs5EI7E5nRer/bwGwDlJbHn7+LxLYagXZEQA8aav1z+VbALQAaAHQAqAFQAuAFgA7dv0zAJqQjYUOfkOUAAAAAElFTkSuQmCC",
          extension: "png"
        }
      ],
      emailOnSave: true
    })
      .then(result => {
        console.log(result);
        createdUser = result;
        expect(result._id).to.exist;
        expect(result.firstName).to.equal('Ryan');
        expect(result.password).to.not.equal('abcd123');
        console.log(result);
        done();
      }).catch(done);
  });

  it('should update a user', done => {
    CRUD.updateUser({
      _id: createdUser._id,
      firstName: "Barry"
    })
      .then(result => {
        console.log(result);
        createdUser = result;
        expect(result._id).to.exist;
        expect(result.firstName).to.equal('Barry');
        expect(result.lastName).to.exist;
        expect(result.password).to.not.exist;
        console.log(result);
        done()
      }).catch(done);
  })

  it('should create user tony', done => {
    CRUD.createUser({
      firstName: "Tony"
    })
      .then(result => {
        expect(result.firstName).to.equal("Tony");
        userTony = result;
        console.log(result);
        done()
      }).catch(done);
  })

  it('should find user Barry', done => {
    CRUD.findUser({firstName: "Barry"})
      .then(result => {
        expect(result.length).to.equal(1);
        expect(result[0].firstName).to.equal("Barry");
        console.log(result);
        done()
      }).catch(done)
  })

  it('should remove user Tony', done => {
    CRUD.removeUser({_id: userTony._id})
      .then(result => {
        console.log(result);
        done()
      }).catch(done);
  })
});

describe('Mongoose Population / RelationalDB', ()=> {
  it('should add 5 widgets to a user', done => {
    Population.createWidgetsAndAddToUser(createdUser._id)
      .then(result => {
        console.log(result);
        expect(result.widgets[0].name).to.not.exist;
        done()
      }).catch(done);
  })

  it('should populate user barry', done => {
    Population.returnPopulatedUser(createdUser._id)
      .then(result => {
        console.log(result);
        expect(result.widgets[0].name).to.exist;
        done()
      }).catch(done);

    /**
     * What about performance you say??
     * Yes there are considerations. However it has not been a problem in any of my projects and the join can be done
     * with only two hits to the database.
     *
     * More info here!
     * http://stackoverflow.com/questions/24096546/mongoose-populate-vs-object-nesting
     */
  });

  it('should populate user barry with a select', done => {
    Population.returnPopulatedUserWithSelect(createdUser._id)
      .then(result => {
        console.log(result);
        expect(result.widgets[0].name).to.not.exist;
        expect(result.widgets[0].price).to.exist;
        done()
      }).catch(done)
  })

});

describe('Mongoose Plugins & Tansformation Hooks', () => {
  it('should apply all transformations', done => {

    CRUD.findUser({firstName: "Barry"}, "+password")
      .then(response => {
        var user = response[0];

        //Merge first and last name to a full name field
        expect(user.fullName).to.equal("Barry Knell");

        //Timestamp plugin adding in automatic created and modified times
        expect(user.createdAt).to.exist;
        expect(user.updatedAt).to.exist;

        //Process the photo data on save and move the photos to disk
        expect(user.photoData.length).to.equal(0);
        expect(user.savedPhotos.length).to.be.above(0);

        expect(user.password).to.exist;
        expect(user.password).to.not.equal('abcd1234');

        var checkedPhotos = 0
        user.savedPhotos.forEach(item =>{
          checkedPhotos++;
          expect(fs.existsSync(item.filename)).to.equal(true);
        })
        expect(checkedPhotos).to.be.above(0);

        done()
      }).catch(done);

    //Super awesome but simple plugin for timestamping

  })
});