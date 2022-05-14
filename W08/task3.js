d3.csv("https://sugimotodot.github.io/InfoVis2022/W08/task1.csv")
  .then( data => {
      data.forEach( d => { d.value = +d.value; });

      var config = {
          parent: "#drawing_region",
          width: 256,
          height: 256,
          radius: 100,
          margin: {top:10, right:10, bottom:20, left:60}
      };

      const scatter_plot = new ScatterPlot( config, data );
      scatter_plot.update();
  })
  .catch( error => {
      console.log( error );
  });

class ScatterPlot {

    constructor( config, data ) {
        this.config = {
            parent: config.parent,
            width: config.width || 256,
            height: config.height || 256,
            radius: config.radius || 100,
            margin: config.margin || {top:10, right:10, bottom:10, left:10}
        }
        this.data = data;
        this.init();
    }

    init() {
        let self = this;

        self.svg = d3.select( self.config.parent )
            .attr('width', self.config.width)
            .attr('height', self.config.height);

        self.chart = self.svg.append('g')
            .attr('transform', `translate(${self.config.margin.left}, ${self.config.margin.top})`);

        self.inner_width = self.config.width - self.config.margin.left - self.config.margin.right;
        self.inner_height = self.config.height - self.config.margin.top - self.config.margin.bottom;

    }

    update() {
        let self = this;

        self.render();

    }

    render() {
        let self = this;

        const pie = d3.pie()
                      .value( d => d.value );

        const arc = d3.arc()
                      .innerRadius(0)
                      .outerRadius(self.config.radius);

        self.chart.selectAll('pie')
                  .data( pie(self.data) )
                  .enter()
                  .append('path')
                  .attr('d', arc)
                  .attr('fill', 'black')
                  .attr('stroke', 'white')
                  .attr('transform', `translate(${self.inner_width/2}, ${self.inner_height/2})`)
                  .style('stroke-width', '2px');
        
    }
}