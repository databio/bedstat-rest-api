import React from "react";
import MaterialTable from "material-table";
import Spinner from "react-bootstrap/Spinner";
import { Paper } from "@material-ui/core";
import { tableIcons } from "./tableIcons";
import { Link } from "react-router-dom";
import { client } from "./const/server";
import { FaMinus } from "react-icons/fa";
import { FaFolderPlus } from "react-icons/fa";
import { GET_BED_DIST } from "./graphql/bedQueries";
// import _ from "lodash";

export default class ResultsBed extends React.Component {
  constructor(props) {
    super();
    this.state = {
      bedData: [],
      columns: [],
      data: [],
      pageSize: -1,
      pageSizeOptions: [],
      myBedSet: JSON.parse(localStorage.getItem('myBedSet')) || []
    };
  }

  async componentDidMount() {
    await this.getBedBySearchTerms();
  }

  async componentDidUpdate(prevProps, prevState) {
    if (prevProps.term !== this.props.term) {
      await this.getBedBySearchTerms();
      this.setState({ term: this.props.term });
    }
  }

  async getBedBySearchTerms() {
    let terms = this.props.terms.split(/[\s,]+/);

    if (terms.length === 1) {
      var data = await client
        .query({
          query: GET_BED_DIST,
          variables: { filters: { searchTermIlike: terms[0] } },
        })
        .then(({ data }) => data.distances.edges);

      var res = []
      data.forEach((bed, index) => {
        if (JSON.parse(bed.node.bedfile.genome).alias === this.props.genome) {
          res.push(bed);
        }
      });
      console.log(res)
      res = res.slice().sort((a, b) => a.node.score - b.node.score);
    } else {
      var filter = []
      terms.forEach((term, index) => {
        filter.push({ searchTermIlike: term });
      })
      data = await client
        .query({
          query: GET_BED_DIST,
          variables: { filters: { or: filter } },
        })
        .then(({ data }) => data.distances.edges);

      var res_all = []
      data.forEach((bed, index) => {
        if (JSON.parse(bed.node.bedfile.genome).alias === this.props.genome) {
          res_all.push(bed);
        }
      });
      var res_group = this.groupBy(res_all, "bedId");

      res = [];
      res_group.forEach((bed, index) => {
        const thresh = 0.5
        let avg_score = (bed.reduce((total, next) => total + next.node.score, 0) + thresh * (terms.length - bed.length)) / terms.length;
        data = { ...bed[0].node, score: avg_score };

        delete data.searchTerm;
        res.push({ node: data })
      });

      res = res.slice().sort((a, b) => a.node.score - b.node.score);
      console.log(res)
    }

    this.setState({ bedData: res });
    this.props.setSearchingFalse(false);

    if (res.length >= 50) {
      this.setState({
        pageSize: 50,
        pageSizeOptions: [50, 100, 150],
      });
    } else {
      this.setState({
        pageSize: res.length,
        pageSizeOptions: [res.length],
      });
    }
    this.setState({ terms: this.props.terms });
    this.getColumns();
    this.getData();
  }

  groupBy(arr, prop) {
    const map = new Map(Array.from(arr, obj => [obj.node[prop], []]));
    arr.forEach(obj => map.get(obj.node[prop]).push(obj));
    return Array.from(map.values());
  }

  getUnique(arr1, arr2) {
    var uniqueArr = []
    for (var i = 0; i < arr1.length; i++) {
      var flag = 0;
      for (var j = 0; j < arr2.length; j++) {
        if (arr1[i] === arr2[j]) {
          arr2.splice(j, 1);
          j--;
          flag = 1;
        }
      }

      if (flag === 0) {
        uniqueArr.push(arr1[i]);
      }
    }
    uniqueArr.push(arr2);
    return uniqueArr;
  }

  // getAvgDist(old_res, new_res) {

  //   const thresh = 0.5
  //   var oldres = _.cloneDeep(old_res);
  //   var newres = _.cloneDeep(new_res);
  //   var avg_res = [];
  //   var bed_old = old_res.map((bed, index) => {
  //     return bed.node.bedId;
  //   });
  //   var bed_new = new_res.map((bed, index) => {
  //     return bed.node.bedId;
  //   });
  //   const bedunique = this.getUnique(bed_old, bed_new)

  //   avg_res = oldres.map((bed, index) => {
  //     if (bedunique.includes(bed.node.bedId)) {
  //       if (JSON.parse(bed.node.bedfile.genome).alias === this.props.genome) {
  //         bed.node.score =
  //           (bed.node.score + thresh) / 2;
  //         return bed;
  //       }
  //     } else {

  //       if (JSON.parse(bed.node.bedfile.genome).alias === this.props.genome) {
  //         var new_res_idx = new_res.findIndex(function (new_bed) {
  //           return new_bed.node.bedId === bed.node.bedId;
  //         });

  //         bed.node.score =
  //           (bed.node.score + new_res[new_res_idx].node.score) / 2;

  //         return bed;

  //       }
  //     }
  //     return {}
  //   });

  //   newres.forEach((bed, index) => {
  //     if (bedunique.includes(bed.node.bedId)) {
  //       if (JSON.parse(bed.node.bedfile.genome).alias === this.props.genome) {
  //         bed.node.score =
  //           (bed.node.score + thresh) / 2;
  //         avg_res.push(bed);
  //       }
  //     }
  //   }
  //   )

  //   avg_res = avg_res.filter(value => Object.keys(value).length !== 0);

  //   return avg_res;
  // }

  getColumns() {
    let tableColumns = [];
    let cols = ["name", "relevance", "data_source", "description"];

    for (var i = 0; i < cols.length; i++) {
      if (cols[i] === "name") {
        tableColumns.push({
          title: cols[i],
          field: cols[i],
          cellStyle: {
            width: 500,
            maxWidth: 500,
          },
          headerStyle: {
            width: 500,
            maxWidth: 500,
          },
          render: (rowData) => (
            <Link
              className="home-link"
              to={{
                pathname: "/bedsplash/" + rowData.md5sum,
              }}
            >
              {rowData.name}
            </Link>
          ),
        });
      } else if (cols[i] === "description") {
        tableColumns.push({
          title: cols[i],
          field: cols[i],
          cellStyle: {
            width: 600,
            minWidth: 600,
          },
          headerStyle: {
            width: 600,
            minWidth: 600,
          },
        });
      } else if (cols[i] === "data_source") {
        tableColumns.push({
          title: cols[i],
          field: cols[i],
          render: (rowData) =>
            rowData.data_source === "GEO" ? (
              <a
                href={
                  "https://www.ncbi.nlm.nih.gov/geo/query/acc.cgi?acc=" +
                  rowData.GSE
                }
                className="home-link"
              >
                {rowData.data_source}
              </a>
            ) : rowData.data_source === "ENCODE" ? (
              <a
                href={"https://www.encodeproject.org/files/" + rowData.file_acc}
                className="home-link"
              >
                {rowData.data_source}
              </a>
            ) : null,
        });
      } else {
        tableColumns.push({
          title: cols[i],
          field: cols[i],
        });
      }
    }
    this.setState({
      columns: tableColumns,
    });
  }

  getData() {
    let data = this.state.bedData.map((bed) => {
      let row = {
        id: bed.node.bedId,
        name: bed.node.bedfile.name,
        md5sum: bed.node.bedfile.md5sum,
        relevance: this.getRelevance(bed.node.score),
      };
      row = Object.assign({}, row, JSON.parse(bed.node.bedfile.other));
      return row;
    })

    this.setState({
      data: data,
    });
  }

  perc2Color(perc) {
    const gradient = [
      [209, 14, 0],
      [255, 215, 0],
      [0, 161, 5],
    ];
    if (perc < 0.5) {
      var color1 = gradient[1];
      var color2 = gradient[0];
      var upper = 0.5;
      var lower = 0;
    } else {
      color1 = gradient[2];
      color2 = gradient[1];
      upper = 1;
      lower = 0.5;
    }
    var firstcolor_x = lower;
    var secondcolor_x = upper - firstcolor_x;
    var slider_x = perc - firstcolor_x;
    var ratio = slider_x / secondcolor_x;

    var w = ratio * 2 - 1;
    var w1 = (w / 1 + 1) / 2;
    var w2 = 1 - w1;
    var rgb = [
      Math.round(color1[0] * w1 + color2[0] * w2),
      Math.round(color1[1] * w1 + color2[1] * w2),
      Math.round(color1[2] * w1 + color2[2] * w2),
    ];
    return rgb;
  }

  getRelevance(score) {
    let color = this.perc2Color(1 - score);
    score = ((1 - score) * 100).toFixed(2).toString() + "%";
    return (
      <p>
        <FaMinus
          style={{ marginRight: "5px", fontSize: "20px" }}
          color={"rgb(" + color.join() + ")"}
        />
        {score}
      </p>
    );
  }

  addtoBedSet(data) {
    alert("You added " + data.name + " to your BED set.")
    this.setState({
      myBedSet: [...this.state.myBedSet, { "id": data.id, "name": data.name, "md5sum": data.md5sum }]
    }, () => {
      localStorage.setItem('myBedSet', JSON.stringify(this.state.myBedSet))
    })


  }

  render() {
    return this.props.md5sum === this.state.md5sum ||
      this.props.query === this.state.query ||
      this.props.term === this.state.term ? (
      this.state.pageSize !== -1 ? (
        <div>
          <MaterialTable
            icons={tableIcons}
            columns={this.state.columns}
            data={this.state.data}
            actions={[
              {
                icon: () => < FaFolderPlus className="my-icon" />,
                tooltip: 'add to your BED set',
                onClick: (event, rowData) => this.addtoBedSet(rowData)
              }
            ]}
            title=""
            options={{
              headerStyle: {
                backgroundColor: "#264653",
                color: "#FFF",
                fontWeight: "bold",
              },
              paging: true,
              pageSize: this.state.pageSize,
              pageSizeOptions: this.state.pageSizeOptions,
              search: false,
              toolbar: false,
            }}
            components={{
              Container: (props) => <Paper {...props} elevation={0} />,
            }}
            localization={{
              body: {
                emptyDataSourceMessage: (
                  <div style={{ position: "absolute", top: "5%", left: "50%" }}>
                    <Spinner
                      animation="border"
                      size="sm"
                      style={{ marginRight: "5px", color: "lightgray" }}
                    />
                    <p style={{ color: "lightgray" }}>Loading data </p>
                  </div>
                ),
              },
            }}
          />
        </div>
      ) : (<div>
        <Spinner
          animation="border"
          size="sm"
          style={{ marginRight: "5px", color: "lightgray" }}
        />
        <p style={{ color: "lightgray" }}>Loading data </p>
      </div>)
    ) : null;
  }
}
