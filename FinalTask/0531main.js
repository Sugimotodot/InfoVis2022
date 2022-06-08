d3.csv("https://sugimotodot.github.io/InfoVis2022/FinalTask/test1_rev.csv")
  .then( data => {
      data.forEach( d => { d.Sums = +d.Sums; d.Education = +d.Education; d.Area = +d.Area; });

        var config = {
            parent: '#drawing_region',
            width: 1024,
            height: 768,
            margin: {top:25, right:10, bottom:50, left:150},
            title: 'Nationality of New tourlists in Japan',
            xlabel: 'People',
            ylabel: 'Country'
        };

        const bar_chart = new BarChart( config, data );
        bar_chart.update();

        d3.select('#reverse').on('click', d => { bar_chart.sort('reverse'); bar_chart.update(); });
        d3.select('#descend').on('click', d => { bar_chart.sort('descend'); bar_chart.update(); });
        d3.select('#ascend').on('click', d => { bar_chart.sort('ascend'); bar_chart.update(); });

        d3.select('#pup').on('onchange', d => { bar_chart.update(); });
    })
    .catch( error => {
        console.log( error );
    });

class BarChart {
    constructor (config, data) {
        this.config = {
            parent: config.parent,
            width: config.width || 256,
            height: config.height || 256,
            margin: config.margin || {top:10, right:10, bottom:10, left:10},
            title: config.title || '',
            xlabel: config.xlabel || '',
            ylabel: config.ylabel || '',
            duration: config.duration || 1000
        };
        this.data = data;
        this.init();
    }

    init() {
        let self = this;

        self.svg = d3.select(self.config.parent)
            .attr('width', self.config.width)
            .attr('height', self.config.height);

        self.chart = self.svg.append('g')
            .attr('transform', `translate(${self.config.margin.left}, ${self.config.margin.top})`);

        self.inner_width = self.config.width - self.config.margin.left - self.config.margin.right;
        self.inner_height = self.config.height - self.config.margin.top - self.config.margin.bottom;

        self.xscale = d3.scaleLinear()
            .range([0, self.inner_width]);

        self.yscale = d3.scaleBand()
            .range([0, self.inner_height])
            .paddingInner(0.2)
            .paddingOuter(0.1);

        self.xaxis = d3.axisBottom(self.xscale)
            .ticks(5)
            .tickSizeOuter(0);

        self.yaxis = d3.axisLeft(self.yscale)
            .tickSizeOuter(0);

        self.xaxis_group = self.chart.append('g')
            .attr('transform', `translate(0, ${self.inner_height})`);

        self.yaxis_group = self.chart.append('g');

        const title_space = 10;
        self.svg.append('text')
            .style('font-size', '20px')
            .style('font-weight', 'bold')
            .attr('text-anchor', 'middle')
            .attr('x', self.config.width / 2)
            .attr('y', self.config.margin.top - title_space)
            .text( self.config.title );

        const xlabel_space = 40;
        self.svg.append('text')
            .attr('x', self.config.width / 2)
            .attr('y', self.inner_height + self.config.margin.top + xlabel_space)
            .text( self.config.xlabel );

        const ylabel_space = 90;
        self.svg.append('text')
            .attr('transform', `rotate(-90)`)
            .attr('y', self.config.margin.left - ylabel_space)
            .attr('x', -(self.config.height / 2))
            .attr('text-anchor', 'middle')
            .attr('dy', '1em')
            .text( self.config.ylabel );

        self.color_palette = d3.scaleOrdinal(d3.schemeSet1);

        self.chart.append("text")
                  .attr("id", "char")
                  .attr("transform", "translate(0,0)")
                  .text( "" );

        d3.select(self.config.parent)
          .append('image')
          .attr('id', 'image');

        d3.select(self.config.parent)
          .append('g')
          .attr('id', 'pie')
          .attr('transform', `translate(${self.config.margin.left}, ${self.config.margin.top})`);
    }

    update() {
        let self = this;

        const space = 10;
        const xmin = 0;
        const xmax = d3.max(self.data, d => d.Sums) + space;
        self.xscale.domain([xmin, xmax*1.2]);

        const items = self.data.map(d => d.Country);
        self.yscale.domain(items);

        self.render();
    }

    render() {
        let self = this;

        self.chart.selectAll("rect")
            .data(self.data)
            .join("rect")
            .on("mouseover", self.onMouseOver)
            .on("mouseout", self.onMouseOut)
            .on('mousemove', (e) => {
                const padding = 10;
                d3.select('#tooltip')
                  .style('left', (e.pageX + padding) + 'px')
                  .style('top', (e.pageY + padding) + 'px');
            })
            .on('mouseleave', () => {
                d3.select('#tooltip')
                  .style('opacity', 0);
            })
            .transition().duration(self.config.duration)
            .attr("x", 0)
            .attr("y", d => self.yscale(d.Country))
            .attr("width", d => self.xscale(d.Sums))
            .attr("height", self.yscale.bandwidth())
            .attr("value", d => d.Sums)
            .attr("country", d => d.Country)
            .attr("area", d => d.Area)
            .attr("abb", d => d.Abb)
            .attr("color", d => self.color_palette(d.Area))
            .attr("fill", d => self.color_palette(d.Area));

        self.xaxis_group.call(self.xaxis);

        self.yaxis_group.transition().duration(self.config.duration)
                        .call(self.yaxis);
    }

    sort( order ) {
        let self = this;

        switch (order) {
        case 'reverse':
            self.data.reverse();
            break;
        case 'descend':
            self.data.sort( (a,b) => b.Sums - a.Sums );
            break;
        case 'ascend':
            self.data.sort( (a,b) => a.Sums - b.Sums );
            break;
        }
    }

    onMouseOver() {
        let self = this;

        const cor = d3.select(this)
        cor.transition()
           .duration(200)
           .attr("fill", 'orange');

        console.log(cor.attr("value"));

        d3.selectAll("#char")
          .attr("x", +cor.attr("width") + 5)
          .attr("y", +cor.attr("y") + 15)
          .attr("stroke", cor.attr("color"))
          .text( cor.attr("value") );

        var imgList = ['fantasy_china_keiten'];

        d3.selectAll("#image")
          .attr('width', 50)
          .attr('height', 50)
          .attr("x", +cor.attr("width") + 200)
          .attr("y", +cor.attr("y") + 8)
          .attr('xlink:href', 'https://www.asahi-net.or.jp/~yq3t-hruc/img/' + cor.attr("abb") + '.gif');

        d3.select('#tooltip')
          .style('opacity', 1)
          .html(`<div class="tooltip-label">${cor.attr("country")}</div>`);

        d3.select('#pie')
          .attr('width', 80)
          .attr('height', 80)
    }

    onMouseOut(d, i) {
        let self = this;

        const cor = d3.select(this)
        const color_palette = d3.scaleOrdinal(d3.schemeSet1);
        cor.transition()
           .duration(200)
           .attr("fill", cor.attr("color"));

        d3.selectAll("#image")
          .transition().duration(400)
          .attr('xlink:href', null);
    }
}

