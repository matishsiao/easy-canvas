var EasyCanvas = function(container,param) {
 	var self = this;
 	self.name = container;
	self.stage = null;
  self.canvas = null;
	self.chart = param.chart;
	self.mousePos = {x:0,y:0};
	self.margin = 2;
  self.chartColors = ["#005F00","#A0A500","#B0B040","#C0C0C0","#FDDF0F","#0F1FFE"];
	self.zoom = {
		enabled:true,
    zoomType:"zoom",
		zoomIn:false,
    moveIn:false,
    movePos:{
      start:0,
      end:0
    },
    status:false,
		start:{x:0,y:0},
		end:{x:0,y:0},
		color:"#0000FF",
		series:[],
    originSeries:[]
	};
  self.draw = {
    enabled:false,
    status:false,
    color:"#0F0FF0",
    painerList:[],
    movePos:{
      start:{x:0,y:0},
      end:{x:0,y:0}
    },
    painer:{
      type:"",
      movePos:{
        start:{x:0,y:0},
        end:{x:0,y:0}
      },
      data:{
        start:{x:0,y:0},
        end:{x:0,y:0}
      }
    }
  };
	self.chart.series = param.series;
	self.chart.color = (typeof(self.chart.color) == "undefined")?"#ECECEC":self.chart.color;
	self.Grid = {
  		color:"#00000F",
  		selectColor:"#00FF0F",
  		fontSize:10,
  		width:4,
  		margin:20,
  		maxFontSize:18,
  		border:1,
  		borderColor:"#000"
	};
	self.Line = {
		width:1,
		markWidth:4,
		color:"#F00F0F",
		selectColor:"#00FF00",
		margin:15
	};
	self.BaseLine = {
		width:1,
		markWidth:3,
		color:"#F00F0F",
		plusColor:"#FF0F0F",
  		lessColor:"#00FFFF",
		selectColor:"#00FF00",
		margin:15
	};
	self.Bar = {
  		color:"#F00F0F",
  		selectColor:"#00FF0F",
  		width:4,
  		margin:5,
  		border:1,
  		borderColor:"#000"
	};
	self.BaseLineBar = {
  		plusColor:"#FF0F0F",
  		lessColor:"#00FF0F",
  		selectColor:"#0000FF",
  		width:4,
  		margin:5,
  		border:1,
  		borderColor:"#000"
	};
	self.Tooltip = {
  		color:"#FF000F",
  		fontSize:10,
  		margin:0,
  		border:1,
  		borderColor:"#000"
	};
	self.grid = {
  			xAxis:{
  				series:[],
  				options:{}
  			},
  			yAxis:{
  				series:[],
  				options:{}
  			}
  		};
	self.tooltip = null;
  EasyCanvas.prototype.create = function() {
		var div = document.getElementById(self.name);
		self.stage = div;
		div.innerHTML = "";
		var canvas = document.createElement('canvas');
    canvas.id = "ec-canvas";
    canvas.name = "ec-canvas";
    canvas.style.cursor = "auto";
		canvas.height = self.chart.height;
		canvas.width = self.chart.width;
		self.canvas = canvas;
		div.appendChild(canvas);
		if (typeof G_vmlCanvasManager != 'undefined') {
			canvas = G_vmlCanvasManager.initElement(canvas);
		}
		var ctx = canvas.getContext("2d");
		self.ctx = ctx;
		var tooltip = document.createElement('div');
		tooltip.id = "ec-tooltip";
		tooltip.name = "ec-tooltip";
		tooltip.style.position = "absolute";
		tooltip.style.display = "none";
		tooltip.style.left = -self.chart.height+"px";
		tooltip.style.top = -self.chart.width+"px";
		tooltip.style.color = self.Tooltip.color;
		tooltip.style.fontSize = self.Tooltip.fontSize;
		tooltip.style.margin = self.Tooltip.margin;
		tooltip.width = 100;
		tooltip.height = 100;
		div.appendChild(tooltip);
		self.tooltip = tooltip;
    self.dataInit();
		self.drawBackground();
		self.listenerInit();
	};

  EasyCanvas.prototype.dataInit = function() {
    for(var i = 0;i < self.chart.series.length;i++) {
      self.chart.series[i].id = i;
      self.chart.series[i].rawPoints = self.chart.series[i].data;
      self.chart.series[i].points = self.chart.series[i].data;
      self.chart.series[i].chartPoints = [];
      self.chart.series[i].xAxis = {series:[],options:{}};
      self.chart.series[i].yAxis = {series:[],options:{}};
      if(typeof(self.chart.series[i].height) == "undefined") {
        self.chart.series[i].height = self.chart.height;
      }
      if(typeof(self.chart.series[i].color) == "undefined") {
        colorIdx = i%self.chartColors.length;
        self.chart.series[i].color = self.chartColors[colorIdx];
      }

      if(typeof(self.chart.series[i].width) == "undefined") {
        self.chart.series[i].width = self.chart.width;
      }

      if(typeof(self.chart.series[i].top) == "undefined") {
        self.chart.series[i].top = 0;
      } else {
        if(self.chart.series[i].top + self.chart.series[i].height >= self.chart.height)
          self.chart.series[i].height = self.chart.height - self.chart.series[i].top;
      }

      if(typeof(self.chart.series[i].left) == "undefined") {
        self.chart.series[i].left = 0;
      } else {
        if(self.chart.series[i].left + self.chart.series[i].width >= self.chart.width)
          self.chart.series[i].width = self.chart.width - self.chart.series[i].left;
      }
      self.zoom.originSeries[i] = [];
      self.zoom.series[i] = [];
    }
  };

	EasyCanvas.prototype.listenerInit = function() {
		$("#ec-canvas").bind('mousemove', self.getMousePos );
    $("#ec-canvas").bind('mouseout', self.leaveStage );
    $("#ec-canvas").bind('mousedown', self.dragStageStart );
    $("#ec-canvas").bind('mouseup', self.dragStageEnd );
	};

  EasyCanvas.prototype.render = function() {
    self.drawBackground();
    for(var i = 0;i < self.chart.series.length;i++){
      var chart = self.chart.series[i];
      switch(chart.type) {
        case "bar":
            self.processBar(chart);
        break;
        case "line":
            self.processLine(chart);
        break;
        case "baselinebar":
          self.processBaseLineBar(chart);
        break;
        case "baseline":
          self.processBaseLine(chart);
        break;
      }
    }
  }

	EasyCanvas.prototype.drawBackground = function() {
  	self.ctx.fillStyle = self.chart.color;
		self.ctx.clearRect(0, 0, self.chart.width, self.chart.height);
		self.ctx.fillRect(0, 0, self.chart.width, self.chart.height);
	};

	EasyCanvas.prototype.drawGridBackground = function(chart) {
		self.calcGrid(chart);
  	self.ctx.font = self.Grid.fontSize +"px Georgia";
  	self.ctx.fillStyle = self.Grid.color;
  	max = 0;
  	min = 0;
  	for(idx in chart.yAxis.series) {
  			var grid = chart.yAxis.series[idx];
  			if (max == 0 && min == 0){
  				max = grid.y;
  				min = grid.y;
  			} else {
  			if (grid.y > max)
  				max = grid.y;
  			if (grid.y < min)
  				min = grid.y;
  			}
  			self.drawLine(self.Grid.color,self.Grid.margin-2,grid.y,chart.width - self.Grid.margin,grid.y);
  			self.ctx.fillText(grid.text,grid.x,grid.y,self.Grid.maxFontSize);
  	}

    self.drawLine(self.Grid.color,self.Grid.margin,max,self.Grid.margin,min);
    fontSize = (chart.xAxis.series.length < 10)?30:self.Grid.maxFontSize;
  	for(idx in chart.xAxis.series) {
  			var grid = chart.xAxis.series[idx];
  			self.ctx.fillText(grid.text,grid.x,grid.y,fontSize);
  	}
	};

	EasyCanvas.prototype.calcNormalGrid = function(chart) {
  	stageHeight = (chart.height - self.Grid.margin * 2);
  	chart.yAxis.series = [];
  	gridPct = ((chart.yAxis.options.range) / 7);
  	for(var i = 0;i < 8;i++) {
  		var value = chart.yAxis.options.min + (gridPct * i);
  		var pct = Math.abs(chart.yAxis.options.min - value);
  		var grid = {
  			x:0,
  			y:chart.top + chart.height - ((pct/chart.yAxis.options.range) * stageHeight) - self.Grid.margin,
  			text:Math.floor(value),
  			range:gridPct
  		};
  		chart.yAxis.series.push(grid);
  	}

  	chart.xAxis.series = [];
    var showRange = 6;
    if(chart.xValueType == "datetime"){
      gridPct = Math.ceil((chart.chartPoints.length) / showRange);
    	for(var i = 0;i < showRange+1;i++) {
    		var idx = gridPct * i;
    		if(idx >= chart.chartPoints.length)
    			continue;
    		var value = chart.chartPoints[idx].data[0];
        var startTime = 0;
        var endTime = 0;
        var forwardIdx = (gridPct * (i-1) <= 0)?0:gridPct * (i-1);
        var endIdx = (i == 0)?1:idx-1;
        if(endIdx >= chart.chartPoints.length)
          endIdx = chart.chartPoints.length - 1;
        if(forwardIdx == 0 && i == 0)
          forwardIdx = endIdx;
        startTime = chart.chartPoints[idx].data[0];
        endTime = chart.chartPoints[forwardIdx].data[0];
        var timeRange = Math.abs(startTime - endTime)/1000;


        var timeFormat = "";
        if(timeRange < 60){//less one min

          start = self.dateFormat(startTime,"%d");
          end = self.dateFormat(endTime,"%d");
          if(start == end){
            start = self.dateFormat(startTime,"%h");
            end = self.dateFormat(endTime,"%h");
            if(start == end){
              start = self.dateFormat(startTime,"%i");
              end = self.dateFormat(endTime,"%i");
              if(start == end){
                timeFormat = "%h:%i:%s";
              } else
                timeFormat = "%h:%i";
            } else
              timeFormat = "%h:%i";
          } else
            timeFormat = "%m-%d";
        } else if(timeRange < (60 * 60)){//less one hour

          start = self.dateFormat(startTime,"%d");
          end = self.dateFormat(endTime,"%d");
          if(start == end)
            timeFormat = "%h:%i";
          else
            timeFormat = "%m-%d";
        } else if (timeRange < (60 * 60 * 24)){ // day
          start = self.dateFormat(startTime,"%d");
          end = self.dateFormat(endTime,"%d");
          if(start == end)
            timeFormat = "%h:%i";
          else
            timeFormat = "%m-%d";
        }else
          timeFormat = "%m-%d";

        var grid = {
    		  x:(idx * (chart.xAxis.options.width  + self.margin)) + self.Grid.margin,
    			y:chart.top + chart.height - self.Grid.fontSize/2,
    			text:self.dateFormat(value,timeFormat),
    			range:gridPct
    		};
    		chart.xAxis.series.push(grid);
    	}
    } else {
      gridPct = Math.ceil((chart.chartPoints.length) / 8);
    	for(var i = 0;i < 9;i++) {
    		idx = gridPct * i;
    		if(idx >= chart.chartPoints.length)
    			continue;
    		var value = chart.chartPoints[idx].data[0];
    		var grid = {
    		  x:(idx * (chart.xAxis.options.width  + self.margin)) + self.Grid.margin,
    			y:chart.top + chart.height - self.Grid.fontSize/2,
    			text:Math.floor(value),
    			range:gridPct
    		};
    		chart.xAxis.series.push(grid);
    	}
    }
  }

	EasyCanvas.prototype.calcBaselineGrid = function(chart) {
  	stageHeight = (chart.height - self.Grid.margin * 2);
		gridPct = ((chart.yAxis.options.range) / 4);
  	chart.yAxis.series = [];
  	for(var i = 0;i < 5;i++) {
  		var value = (gridPct * i);
  		var pct = Math.abs(value);
  		var grid = {
  			x:0,
				y:chart.top + chart.height / 2 - ((pct/chart.yAxis.options.range) * stageHeight / 2),
  			text:Math.floor(value),
  			range:gridPct
  		};
  		chart.yAxis.series.push(grid);
  	}
  	//less line
  	for(var i = 0;i < 5;i++) {
  		var value = -(gridPct * i);
  		var pct = Math.abs(value);
  		var grid = {
  			x:0,
  			y:chart.top + chart.height / 2 + ((pct/chart.yAxis.options.range) * stageHeight / 2),
  			text:Math.floor(value),
  			range:gridPct
  		};
  		chart.yAxis.series.push(grid);
  	}
    chart.xAxis.series = [];
    var showRange = 6;
    if(chart.xValueType == "datetime"){
      gridPct = Math.ceil((chart.chartPoints.length) / showRange);
    	for(var i = 0;i < showRange+1;i++) {
    		var idx = gridPct * i;
    		if(idx >= chart.chartPoints.length)
    			continue;
    		var value = chart.chartPoints[idx].data[0];
        var startTime = 0;
        var endTime = 0;
        var forwardIdx = (gridPct * (i-1) <= 0)?0:gridPct * (i-1);
        var endIdx = (i == 0)?1:idx-1;
        if(endIdx >= chart.chartPoints.length)
          endIdx = chart.chartPoints.length - 1;
        if(forwardIdx == 0 && i == 0)
          forwardIdx = endIdx;
        startTime = chart.chartPoints[idx].data[0];
        endTime = chart.chartPoints[forwardIdx].data[0];
        var timeRange = Math.abs(startTime - endTime)/1000;


        var timeFormat = "";
        if(timeRange < 60){//less one min

          start = self.dateFormat(startTime,"%d");
          end = self.dateFormat(endTime,"%d");
          if(start == end){
            start = self.dateFormat(startTime,"%h");
            end = self.dateFormat(endTime,"%h");
            if(start == end){
              start = self.dateFormat(startTime,"%i");
              end = self.dateFormat(endTime,"%i");
              if(start == end){
                timeFormat = "%h:%i:%s";
              } else
                timeFormat = "%h:%i";
            } else
              timeFormat = "%h:%i";
          } else
            timeFormat = "%m-%d";
        } else if(timeRange < (60 * 60)){//less one hour

          start = self.dateFormat(startTime,"%d");
          end = self.dateFormat(endTime,"%d");
          if(start == end)
            timeFormat = "%h:%i";
          else
            timeFormat = "%m-%d";
        } else if (timeRange < (60 * 60 * 24)){ // day
          start = self.dateFormat(startTime,"%d");
          end = self.dateFormat(endTime,"%d");
          if(start == end)
            timeFormat = "%h:%i";
          else
            timeFormat = "%m-%d";
        }else
          timeFormat = "%m-%d";

        //console.log(startTime,endTime,timeRange,timeFormat,idx,endIdx,forwardIdx,start,end);
    		var grid = {
    		  x:(idx * (chart.xAxis.options.width  + self.margin)) + self.Grid.margin,
    			y:chart.top + chart.height - self.Grid.fontSize/2,
    			text:self.dateFormat(value,timeFormat),
    			range:gridPct
    		};
    		chart.xAxis.series.push(grid);
    	}
    } else {
      gridPct = Math.ceil((chart.chartPoints.length) / 8);
    	for(var i = 0;i < 9;i++) {
    		idx = gridPct * i;
    		if(idx >= chart.chartPoints.length)
    			continue;
    		var value = chart.chartPoints[idx].data[0];
    		var grid = {
    		  x:(idx * (chart.xAxis.options.width  + self.margin)) + self.Grid.margin,
    			y:chart.top + chart.height - self.Grid.fontSize/2,
    			text:Math.floor(value),
    			range:gridPct
    		};
    		chart.xAxis.series.push(grid);
    	}
    }
	}

	EasyCanvas.prototype.calcGrid = function(chart) {
  		switch(chart.type) {
  			case "bar":
  				self.calcNormalGrid(chart);
  			break;
  			case "line":
  				self.calcNormalGrid(chart);
  			break;
  			case "baseline":
  				self.calcBaselineGrid(chart);
  			break;
  			case "baselinebar":
  				self.calcBaselineGrid(chart);
  			break;
  		}
	};

	EasyCanvas.prototype.drawRect = function(color,gradient,x,y,height,width) {

    inAreaHeight = height - (self.Bar.border * 2);
		inAreaWidth = width - (self.Bar.border * 2);
		// Draw bar background
    self.ctx.fillStyle = self.Bar.borderColor;
    self.ctx.fillRect(x, y, width, height);

    if(gradient){
			gradientColor = self.ctx.createLinearGradient(0, 0, 0, self.chart.height);
   		gradientColor.addColorStop(0.5, color);
    	gradientColor.addColorStop(1, "#FFF");
			self.ctx.fillStyle = gradientColor;
		} else {
			self.ctx.fillStyle = color;
		}

		if(inAreaHeight<=1 || inAreaWidth<=1) {
			self.ctx.fillRect(x, y, width, height);
		} else {
			self.ctx.fillRect(x+self.Bar.border, y+self.Bar.border, inAreaWidth,inAreaHeight);
		}
	};

	EasyCanvas.prototype.drawLine = function(color,x,y,x2,y2) {
  	self.ctx.strokeStyle = color;
  	self.ctx.lineWidth = self.Line.width;
		self.ctx.beginPath();
    self.ctx.moveTo(x,y);
    self.ctx.lineTo(x2,y2);
  	self.ctx.closePath();
		self.ctx.stroke();
	};

	EasyCanvas.prototype.drawLinePath = function(lineColor,data) {
		self.ctx.strokeStyle = lineColor;
		self.ctx.lineWidth = self.Line.width;
		self.ctx.beginPath();
		for(var i = 0;i < data.length;i++) {
			var point = data[i];
			if(i == 0){
				self.ctx.moveTo(point.x,point.y);
			} else {
				self.ctx.lineTo(point.x,point.y);
			}
		}
		self.ctx.stroke();
		for(var i = 0;i < data.length;i++) {
			var point = data[i];
			//self.ctx.fillStyle = (point.selected)?selectColor:color;
      self.ctx.beginPath();
      if(point.selected){
        self.ctx.fillStyle = "#FFF";
        self.ctx.arc(point.x,point.y,self.Line.markWidth+2,0,2*Math.PI);
        self.ctx.fill();
      }
      self.ctx.closePath();
      self.ctx.fillStyle = lineColor;
        self.ctx.beginPath();
      //inline
			self.ctx.arc(point.x,point.y,self.Line.markWidth,0,2*Math.PI);

			self.ctx.fill();
			self.ctx.closePath();
		}
	};

	EasyCanvas.prototype.drawBaseLinePath = function(plusColor,lessColor,selectColor,lineColor,data) {
		self.ctx.strokeStyle = lineColor;
		self.ctx.lineWidth = self.Line.width;
		self.ctx.beginPath();
		for(var i = 0;i < data.length;i++) {
			var point = data[i];
			if(i == 0){
				self.ctx.moveTo(point.x,point.y);
			} else {
				self.ctx.lineTo(point.x,point.y);
			}
		}
		self.ctx.stroke();
		for(var i = 0;i < data.length;i++) {
			var point = data[i];
			self.ctx.fillStyle = (point.selected)?selectColor:(point.data[1] >= 0)?plusColor:lessColor;
			self.ctx.beginPath();
			self.ctx.arc(point.x,point.y,self.Line.markWidth,0,2*Math.PI);
			self.ctx.fill();
			self.ctx.closePath();
		}
	};

	EasyCanvas.prototype.processBaseLineBar = function(chart) {
  		chart.chartPoints = [];
  		stageHeight = (chart.height - (self.Grid.margin * 2));
  		xAxis = {
  			max:0,
  			min:0,
  			range:0,
  			data:[],
  			width:0,
  			gridPct:0
  		};
  		yAxis = {
  			max:0,
  			min:0,
  			range:0,
  			data:[],
  			height:0,
  			gridPct:0
  		};
  		for(var i = 0;i < chart.points.length;i++) {
  			xAxis.data.push(chart.points[i][0]);
  			yAxis.data.push(chart.points[i][1]);
  		}
  		xAxis.max = Math.max.apply(null, xAxis.data)*1.05;
  		xAxis.min = Math.min.apply(null, xAxis.data);
  		xAxis.min = (xAxis.min < 0)?xAxis.min * 1.05:xAxis.min-xAxis.min*0.05;
  		xAxis.range = Math.abs(xAxis.max - xAxis.min);
  		xAxis.width = (chart.width - self.Grid.margin* 2 - (self.margin * (chart.points.length + 1))) / chart.points.length;
  		yAxis.max = Math.max.apply(null, yAxis.data)*1.05;
  		yAxis.min = Math.min.apply(null, yAxis.data);
  		yAxis.min = (yAxis.min < 0)?yAxis.min * 1.05:yAxis.min-yAxis.min*0.05;
  		yAxis.range = (Math.abs(yAxis.max) < Math.abs(yAxis.min))?Math.abs(yAxis.min):Math.abs(yAxis.max);
      yAxis.height = stageHeight/yAxis.range;
  		for(var i = 0;i < chart.points.length;i++) {
  			var point = {
  				data:chart.points[i],
  				pointId:i,
  				selected:false,
  				x:(i * (xAxis.width  + self.margin))+ self.Grid.margin,
  				y:0,
  				height:0
  			};
  			pct = Math.abs(yAxis.data[i]);
  			if(yAxis.data[i] >= 0){
  				point.y = chart.top + chart.height / 2 - ((pct/yAxis.range) * stageHeight / 2) - self.Line.width;
  				point.height = ((pct/yAxis.range) * stageHeight / 2);
  			} else {
  				point.y = chart.top + chart.height / 2 + self.Line.width;
  				point.height = ((pct/yAxis.range) * (stageHeight / 2));
  			}
  			chart.chartPoints.push(point);
  		}

  		chart.xAxis.options = xAxis;
  		chart.yAxis.options = yAxis;
  		self.drawGridBackground(chart);

  		for(var i = 0;i < chart.chartPoints.length;i++) {
  			var point = chart.chartPoints[i];
  			self.drawRect((!point.selected)?((point.data[1] >= 0)?self.BaseLineBar.plusColor:self.BaseLineBar.lessColor):self.BaseLineBar.selectColor,true,point.x,point.y,point.height,chart.xAxis.options.width);
  		}
  	};

	EasyCanvas.prototype.baselineBarUpdate = function(chart) {

  		self.drawGridBackground(chart);
  		for(var i = 0;i < chart.chartPoints.length;i++) {
  			var point = chart.chartPoints[i];
  			self.drawRect((!point.selected)?((point.data[1] >= 0)?self.BaseLineBar.plusColor:self.BaseLineBar.lessColor):self.BaseLineBar.selectColor,true,point.x,point.y,point.height,chart.xAxis.options.width);
  		}
 	};

 	EasyCanvas.prototype.processBaseLine = function(chart) {
  		chart.chartPoints = [];
  		stageWidth = (chart.width - self.Line.margin * 2);
  		stageHeight = (chart.height - self.Grid.margin * 2);
  		xAxis = {
  			max:0,
  			min:0,
  			range:0,
  			data:[],
  			width:0,
  			gridPct:0
  		};
  		yAxis = {
  			max:0,
  			min:0,
  			range:0,
  			data:[],
  			height:0,
  			gridPct:0
  		};
  		for(var i = 0;i < chart.points.length;i++) {
  			xAxis.data.push(chart.points[i][0]);
  			yAxis.data.push(chart.points[i][1]);
  		}
  		xAxis.max = Math.max.apply(null, xAxis.data)*1.05;
  		xAxis.min = Math.min.apply(null, xAxis.data);
  		xAxis.min = (xAxis.min < 0)?xAxis.min * 1.05:xAxis.min-xAxis.min*0.05;
  		xAxis.range = Math.abs(xAxis.max - xAxis.min);
  		xAxis.width = (chart.width - self.Grid.margin* 2 - (self.margin * (chart.points.length + 1))) / chart.points.length;
  		yAxis.max = Math.max.apply(null, yAxis.data)*1.05;
  		yAxis.min = Math.min.apply(null, yAxis.data);
  		yAxis.min = (yAxis.min < 0)?yAxis.min * 1.05:yAxis.min-yAxis.min*0.05;
  		yAxis.range = (Math.abs(yAxis.max) < Math.abs(yAxis.min))?Math.abs(yAxis.min):Math.abs(yAxis.max);

  		yAxis.height = stageHeight/yAxis.range;

  		for(var i = 0;i < chart.points.length;i++) {
  			pct = Math.abs(yAxis.data[i]);
  			var point = {
  				data:chart.points[i],
  				pointId:i,
  				selected:false,
  				x:(i * (xAxis.width  + self.margin))+ self.Grid.margin,
  				y:chart.top + chart.height - ((pct/yAxis.range) * stageHeight) - self.Grid.margin - self.Line.width
  			};
  			if(yAxis.data[i] >= 0){
  				point.y = chart.top + chart.height / 2 - ((pct/yAxis.range) * stageHeight / 2);
  			} else {
  				point.y = chart.top + chart.height / 2 +((pct/yAxis.range) * stageHeight / 2);
  			}
  			chart.chartPoints.push(point);
  		}

  		chart.xAxis.options = xAxis;
  		chart.yAxis.options = yAxis;
  		self.drawGridBackground(chart);
  		self.drawBaseLinePath(self.BaseLine.plusColor,self.BaseLine.lessColor,self.BaseLine.selectColor,chart.color,chart.chartPoints);
  	}
  	EasyCanvas.prototype.baseLineUpdate = function(chart) {

  		self.drawGridBackground(chart);
  		self.drawBaseLinePath(self.BaseLine.plusColor,self.BaseLine.lessColor,self.BaseLine.selectColor,chart.color,chart.chartPoints);
  	};

	EasyCanvas.prototype.processLine = function(chart) {
  		chart.chartPoints = [];
  		stageWidth = (chart.width - self.Grid.margin * 2);
  		stageHeight = (chart.height - self.Grid.margin * 2);
  		xAxis = {
  			max:0,
  			min:0,
  			range:0,
  			data:[],
  			width:0,
  			gridPct:0
  		};
  		yAxis = {
  			max:0,
  			min:0,
  			range:0,
  			data:[],
  			height:0,
  			gridPct:0
  		};
  		for(var i = 0;i < chart.points.length;i++) {
  			xAxis.data.push(chart.points[i][0]);
  			yAxis.data.push(chart.points[i][1]);
  		}
  		xAxis.max = Math.max.apply(null, xAxis.data)*1.05;
  		xAxis.min = Math.min.apply(null, xAxis.data);
  		xAxis.min = (xAxis.min < 0)?xAxis.min * 1.05:xAxis.min-xAxis.min*0.05;
  		xAxis.range = Math.abs(xAxis.max - xAxis.min);
  		xAxis.width = (chart.width - self.Grid.margin * 2 - (self.margin * (chart.points.length + 1))) / chart.points.length;
  		yAxis.max = Math.max.apply(null, yAxis.data)*1.05;
  		yAxis.min = Math.min.apply(null, yAxis.data);
  		yAxis.min = (yAxis.min < 0)?yAxis.min * 1.05:yAxis.min-yAxis.min*0.05;
  		yAxis.range = Math.abs(yAxis.max - yAxis.min);
  		yAxis.height = stageHeight/yAxis.range;

  		for(var i = 0;i < chart.points.length;i++) {
  			var pct = Math.abs(yAxis.min - yAxis.data[i]);
  			var point = {
  				data:chart.points[i],
  				pointId:i,
  				selected:false,
  				x:(i * (xAxis.width  + self.margin))+ self.Grid.margin,
  				y:chart.top + chart.height - ((pct/yAxis.range) * stageHeight) - self.Grid.margin - self.Line.width
  			};
  			chart.chartPoints.push(point);
  		}

  		chart.xAxis.options = xAxis;
  		chart.yAxis.options = yAxis;
  		self.drawGridBackground(chart);
  		self.drawLinePath(chart.color,chart.chartPoints);
  	}
  	EasyCanvas.prototype.lineUpdate = function(chart) {
  		self.drawGridBackground(chart);
  		self.drawLinePath(chart.color,chart.chartPoints);
 	};

	EasyCanvas.prototype.processBar = function(chart) {
  		chart.chartPoints = [];
  		stageHeight = (chart.height - (self.Grid.margin * 2));
  		xAxis = {
  			max:0,
  			min:0,
  			range:0,
  			data:[],
  			width:0,
  			gridPct:0
  		};
  		yAxis = {
  			max:0,
  			min:0,
  			range:0,
  			data:[],
  			height:0,
  			gridPct:0
  		};
  		for(var i = 0;i < chart.points.length;i++) {
  			xAxis.data.push(chart.points[i][0]);
  			yAxis.data.push(chart.points[i][1]);
  		}
  		xAxis.max = Math.max.apply(null, xAxis.data)*1.05;
  		xAxis.min = Math.min.apply(null, xAxis.data);
  		xAxis.min = (xAxis.min < 0)?xAxis.min * 1.05:xAxis.min-xAxis.min*0.05;
  		xAxis.range = Math.abs(xAxis.max - xAxis.min);
  		xAxis.width = (chart.width - self.Grid.margin * 2 - (self.margin * (chart.points.length + 1))) / chart.points.length;
  		yAxis.max = Math.max.apply(null, yAxis.data)*1.05;
  		yAxis.min = Math.min.apply(null, yAxis.data);
  		yAxis.min = (yAxis.min < 0)?yAxis.min * 1.05:yAxis.min-yAxis.min*0.05;
  		yAxis.range = Math.abs(yAxis.max - yAxis.min);
      yAxis.height = stageHeight/yAxis.range;
  		for(var i = 0;i < chart.points.length;i++) {
  			var pct = Math.abs(yAxis.min - yAxis.data[i]);
  			var point = {
  				data:chart.points[i],
  				pointId:i,
  				selected:false,
  				x:(i * (xAxis.width  + self.margin))+ self.Grid.margin,
  				y:chart.top + chart.height - ((pct/yAxis.range) * stageHeight) - self.Grid.margin - self.Line.width,
  				height:((pct/yAxis.range) * stageHeight)
  			};
  			chart.chartPoints.push(point);
  		}

  		chart.xAxis.options = xAxis;
  		chart.yAxis.options = yAxis;
  		self.drawGridBackground(chart);

  		for(var i = 0;i < chart.chartPoints.length;i++) {
  			var point = chart.chartPoints[i];
  			self.drawRect(chart.color,true,point.x,point.y,point.height,chart.xAxis.options.width);
  		}
  	};

	EasyCanvas.prototype.barUpdate = function(chart) {
  		self.drawGridBackground(chart);
  		for(var i = 0;i < chart.chartPoints.length;i++) {
  			var point = chart.chartPoints[i];
  			self.drawRect((!point.selected)?chart.color:self.Bar.selectColor,true,point.x,point.y,point.height,chart.xAxis.options.width);
  		}
 	};



  EasyCanvas.prototype.switchPainer = function() {
    if( !self.draw.enabled ){
      self.draw.enabled = true;
      self.zoom.enabled = false;
      self.draw.painer.type = "line";
    } else {
      self.draw.enabled = false;
      self.zoom.enabled = true;
    }
  }

  EasyCanvas.prototype.pain = function() {
    self.dataUpdate();
    switch(self.draw.painer.type){
      case "line":
        self.drawLine(self.draw.color,self.draw.movePos.start.x,self.draw.movePos.start.y,self.draw.movePos.end.x,self.draw.movePos.end.y);
      break;
    }
  }

  EasyCanvas.prototype.painUpdate = function() {
    switch(self.draw.painer.type){
      case "line":
      for(idx in self.draw.painerList) {
        var point = self.draw.painerList[idx];
        var stageHeight = (point.data.chart.height - self.Grid.margin * 2);
        var showing = true;
        var pointStartY = point.data.chart.top + point.data.chart.height - ((Math.abs(point.data.chart.yAxis.options.min - point.data.start.y)/point.data.chart.yAxis.options.range) * stageHeight) - self.Grid.margin - self.Line.width;
        var pointStartX = 0;
        var pointEndY = point.data.chart.top + point.data.chart.height - ((Math.abs(point.data.chart.yAxis.options.min - point.data.end.y)/point.data.chart.yAxis.options.range) * stageHeight) - self.Grid.margin - self.Line.width;
        var pointEndX = 0;
        var yAxisLimit = {
          start:0,
          end:0
        };
        //out range
        if(point.data.chart.yAxis.options.min > point.data.start.y || point.data.chart.yAxis.options.max < point.data.start.y )
          continue;
          if(point.data.chart.yAxis.options.min > point.data.end.y || point.data.chart.yAxis.options.max < point.data.end.y )
            continue;
        for(var i = 0;i < point.data.chart.chartPoints.length;i++){
            var chartPoint = point.data.chart.chartPoints[i];

            if(chartPoint.data[0] == point.data.start.x.start){
                var nextIdx = i + 1;
                if(nextIdx >= point.data.chart.chartPoints.length)
                  nextIdx = point.data.chart.chartPoints.length - 1;
                if(point.data.chart.chartPoints[nextIdx].data[0] == point.data.start.x.end){
                  var startX = (i * (point.data.chart.xAxis.options.width  + self.margin))+ self.Grid.margin;
                  var endX = (nextIdx * (point.data.chart.xAxis.options.width  + self.margin))+ self.Grid.margin;
                  pointStartX = (startX + endX) / 2;
                }
            } else if(chartPoint.data[0] > point.data.start.x.start && pointStartX == 0){
              pointStartX = self.Grid.margin+ self.margin;
            }

            if(chartPoint.data[0] == point.data.end.x.start){
                var nextIdx = i + 1;
                if(nextIdx >= point.data.chart.chartPoints.length)
                  nextIdx = point.data.chart.chartPoints.length - 1;
                if(point.data.chart.chartPoints[nextIdx].data[0] == point.data.end.x.end){
                  var startX = (i * (point.data.chart.xAxis.options.width  + self.margin))+ self.Grid.margin;
                  var endX = (nextIdx * (point.data.chart.xAxis.options.width  + self.margin))+ self.Grid.margin;
                  pointEndX = (startX + endX) / 2;
                }
            } else if(chartPoint.data[0] < point.data.end.x.start && pointEndX == 0){
              pointEndX = point.data.chart.width - self.Grid.margin;
            }


        }
        if(pointStartX == 0 || pointEndX == 0)
          continue;
        if(pointStartY < point.data.chart.top + self.Grid.margin && pointEndY > point.data.chart.top + point.data.chart.height - self.Grid.margin )
          continue;
        if(pointStartY < point.data.chart.top + self.Grid.margin && pointEndY < point.data.chart.top + self.Grid.margin )
          continue;
        if(pointStartY > point.data.chart.top + point.data.chart.height - self.Grid.margin && pointEndY > point.data.chart.top + point.data.chart.height - self.Grid.margin )
          continue;
        else if(pointStartY < point.data.chart.top + self.Grid.margin && pointEndY <= point.data.chart.top + point.data.chart.height - self.Grid.margin )
          pointStartY = point.data.chart.top + self.Grid.margin;
        else if(pointStartY >= point.data.chart.top + self.Grid.margin && pointEndY > point.data.chart.top + point.data.chart.height - self.Grid.margin )
          pointEndY = point.data.chart.top + point.data.chart.height - self.Grid.margin;
          //console.log(point,pointStartX,pointStartY,pointEndX,pointEndY);

        /*if(pointEndX == 0 && pointStartX != 0){
          pointEndX = point.data.chart.width - self.Grid.margin;
        } else if(pointStartX == 0 && pointEndX != 0)
          pointStartX = self.Grid.margin+ self.margin;
*/
        self.drawLine(self.draw.color,pointStartX,pointStartY,pointEndX,pointEndY);

      }
      break;
    }
  }

  EasyCanvas.prototype.painerStart = function() {
    self.draw.status = true;
    self.draw.movePos.start.x = self.mousePos.x;
    self.draw.movePos.start.y = self.mousePos.y;
    self.draw.movePos.end.x = self.mousePos.x;
    self.draw.movePos.end.y = self.mousePos.y;
  }

  EasyCanvas.prototype.painerMove = function() {
    self.draw.movePos.end.x = self.mousePos.x;
    self.draw.movePos.end.y = self.mousePos.y;
    self.pain();
  }

  EasyCanvas.prototype.painerEnd = function() {
    var painer = {
      type:self.draw.painer.type,
      movePos:self.draw.movePos,
      data:{
        start:{
          y:self.draw.movePos.start.y,
          x:{
            start:0,
            end:0
          }
        },
        end:{
          y:self.draw.movePos.end.y,
          x:{
            start:0,
            end:0
          }
        },
        chart:null
      }
    };
    var add = 0;
    for(idx in self.chart.series) {
      chart = self.chart.series[idx];
      console.log(chart.name);
      add = 0;
      var stageHeight = (chart.height - self.Grid.margin * 2);
      var topLimit = chart.top + self.Grid.margin;
      var widthLimit = chart.left + chart.width - self.Grid.margin;
      var leftLimit = chart.left + self.Grid.margin;
      var heightLimit = chart.top + chart.height - self.Grid.margin;
      if(painer.movePos.start.y < topLimit || painer.movePos.start.y > heightLimit){
        console.log(chart.name,"startY",painer.movePos.start.y,chart.top,chart.height);
        continue;
      }
      if(painer.movePos.start.x < leftLimit || painer.movePos.start.x > widthLimit){
        console.log(chart.name,"startX",painer.movePos.start.x,chart.left,chart.width);
        continue;
      }
      if(painer.movePos.end.y < topLimit || painer.movePos.end.y > heightLimit){
        console.log(chart.name,"endY",painer.movePos.end.y,chart.top,chart.height);
        continue;
      }

      if(painer.movePos.end.x < leftLimit || painer.movePos.end.x > widthLimit){
        console.log(chart.name,"endX",painer.movePos.end.x,chart.left,chart.width);
        continue;
      }
      var chartHeight = chart.top + chart.height - self.Grid.margin - self.Line.width;
      painer.data.start.y = chart.yAxis.options.min + ((chartHeight - painer.movePos.start.y) / chart.yAxis.options.height);
      painer.data.end.y = chart.yAxis.options.min + ((chartHeight - painer.movePos.end.y) / chart.yAxis.options.height);
      for(var i = 0;i < chart.chartPoints.length;i++){
        var nextIdx = (i == 0)?1:i+1;
        if(nextIdx >= chart.chartPoints.length)
          nextIdx = chart.chartPoints.length -1;
        var point = chart.chartPoints[i];
        var nPoint = chart.chartPoints[nextIdx];
        if(point.x <= painer.movePos.start.x - chart.left && nPoint.x >= painer.movePos.start.x - chart.left ){
          if(painer.data.chart == null)
            painer.data.chart = chart;
          else if(painer.data.chart.name != chart.name)
            continue;
          add++;
          painer.data.start.x = {start:point.data[0],end:nPoint.data[0]};
        }
        if(typeof(painer.data.chart) == null)
          continue;
        if(point.x <= painer.movePos.end.x - chart.left  && nPoint.x >= painer.movePos.end.x - chart.left ){
          if(painer.data.chart == null)
            painer.data.chart = chart;
          else if(painer.data.chart.name != chart.name)
            continue;
          add++;
          painer.data.end.x = {start:point.data[0],end:nPoint.data[0]};
        }
      }
      console.log("find:",painer,add,chart.name);
      self.draw.painerList.push(painer);
    }

    console.log(painer,add,self.draw.painerList.length);
    self.dataUpdate();
  }

  EasyCanvas.prototype.painerCancel = function() {

  }

 	EasyCanvas.prototype.dragZoom = function() {
		if(self.zoom.enabled && self.zoom.status) {
			var x = (self.zoom.start.x > self.zoom.end.x)?self.zoom.end.x:self.zoom.start.x;
			var y = (self.zoom.start.y > self.zoom.end.y)?self.zoom.end.y:self.zoom.start.y;
			var width = Math.abs(self.zoom.start.x - self.zoom.end.x);
			var height = Math.abs(self.zoom.start.y - self.zoom.end.y);
      if(self.zoom.zoomType == "zoom") {
  			self.ctx.globalAlpha=0.1;
  			self.drawRect(self.zoom.color,false,x,y,height,width);
  			self.ctx.globalAlpha=1;
      }
		}
	};

	EasyCanvas.prototype.resetZoom = function() {
		self.zoom.zoomType = "zoom";
    for(idx in self.chart.series) {
      chart = self.chart.series[idx];
      chart.points = chart.rawPoints;
    }
    self.zoom.zoomIn = false;
  	self.render();
	};

  EasyCanvas.prototype.ZoomIn = function() {
    self.zoom.zoomType = "zoom";
    self.render();
  };

  EasyCanvas.prototype.ZoomOut = function() {
    self.zoom.zoomType = "zoom";
    if(self.zoom.originSeries.length > 0){
      for(cIdx in self.zoom.originSeries) {
        zoom = self.zoom.originSeries[cIdx];
        for(idx in self.chart.series) {
          chart = self.chart.series[idx];
          if(chart.id == cIdx) {
            if(zoom.length > 0){
              chart.points = [];
              for(idx in chart.rawPoints) {
                var point = chart.rawPoints[idx];
                for(idx in zoom) {
                  var zoomPoint = zoom[idx];
                  if(point[0] == zoomPoint.data[0] && point[1] == zoomPoint.data[1]) {
                    chart.points.push(point);
                  }
                }
              }
            }
          }
        }
      }
    }
    self.zoom.zoomIn = true;
    self.render();
  };

	EasyCanvas.prototype.ZoomMovePoint = function() {
    if(self.zoom.enabled) {
      if(self.zoom.zoomIn) {
        self.zoom.zoomIn = false;
        self.zoom.zoomType = "move";
        self.canvas.style.cursor = "move";
      }
    }
	};

	EasyCanvas.prototype.dragScanSeries = function(dragStatus) {
		var x = (self.zoom.start.x > self.zoom.end.x)?self.zoom.end.x:self.zoom.start.x;
		var y = (self.zoom.start.y > self.zoom.end.y)?self.zoom.end.y:self.zoom.start.y;
		var width = Math.abs(self.zoom.start.x - self.zoom.end.x);
		var height = Math.abs(self.zoom.start.y - self.zoom.end.y);
    if(self.zoom.zoomType == "zoom") {
      for(var i = 0;i < self.chart.series.length;i++) {
        chart = self.chart.series[i];
        var hitPoints = [];
        for(var s = 0;s < chart.chartPoints.length;s++) {
          var point = chart.chartPoints[s];
          if(point.x >= x && point.x <= x + width) {
            if(point.y >= y && point.y <= y + height) {
              hitPoints.push(point);
            }
          }
        }
        if(hitPoints.length == 0)
          continue;
        if( self.zoom.series[chart.id].length == 0)
          self.zoom.originSeries[chart.id] = chart.chartPoints;
        else
          self.zoom.originSeries[chart.id] = self.zoom.series[chart.id];
        self.zoom.series[chart.id] = hitPoints;
        if(hitPoints.length > 0){
          chart.points = [];
          for(idx in chart.rawPoints) {
            var point = chart.rawPoints[idx];
            for(hIdx in hitPoints) {
              var zoomPoint = hitPoints[hIdx];
              if(point[0] == zoomPoint.data[0] && point[1] == zoomPoint.data[1]) {
                chart.points.push(point);
              }
            }
          }
        }
      }

      self.zoom.zoomIn = true;
  		self.render();
      self.painUpdate();
    } else if (self.zoom.zoomType == "move" && width > 0 && !dragStatus) {
      if(!self.zoom.moveIn){
          self.zoom.moveIn = true;
          self.zoom.movePos.start = self.zoom.end.x;
          setTimeout(function(){
            self.zoomMove();
            self.zoom.moveIn = false;
          },100);
      }
    }
	};

  EasyCanvas.prototype.zoomMove = function() {
    var movePoint = 1;
    var way = (self.zoom.movePos.start < self.zoom.end.x)?true:false;
    if(self.zoom.series.length > 0) {
      for(zIdx in self.zoom.series) {
        var chart = null;
        for(var i = 0;i < self.chart.series.length;i++) {
          if(self.chart.series[i].id == zIdx){
            chart = self.chart.series[i];
            break;
          }
        }
        if(chart == null|| self.zoom.series[zIdx].length == 0)
          continue;
        var zoom = self.zoom.series[zIdx];
        var startPoint = zoom[0];
        var endPoint = zoom[zoom.length - 1];
        var startIdx = -1;
        var endIdx = -1;
        for(var i = 0;i < chart.rawPoints.length;i++) {
          var point = chart.rawPoints[i];
          if(way){
            if(point[0] == startPoint.data[0] && point[1] == startPoint.data[1]) {
              startIdx = (i + movePoint >= chart.rawPoints.length)?chart.rawPoints.length:i + movePoint;
            }
            if(point[0] == endPoint.data[0] && point[1] == endPoint.data[1]) {
              endIdx = (i + movePoint >= chart.rawPoints.length)?chart.rawPoints.length:i + movePoint;
            }
          } else {
            if(point[0] == startPoint.data[0] && point[1] == startPoint.data[1]) {
              startIdx = (i - movePoint <= 0)?0:i - movePoint;
            }
            if(point[0] == endPoint.data[0] && point[1] == endPoint.data[1]) {
              endIdx = (i - movePoint <= 0)?0:i - movePoint;
            }
          }
        }

        var serStart = (startIdx > endIdx)?endIdx:startIdx;
        var serEnd = (startIdx < endIdx)?endIdx:startIdx;

        if(serStart == 0 && chart.rawPoints[startIdx][0] == startPoint.data[0] && chart.rawPoints[startIdx][1] == startPoint.data[1]) {
            console.log("start zero");
            return;
        }

        if(serEnd >= chart.rawPoints.length && chart.rawPoints[endIdx-1][0] == endPoint.data[0] && chart.rawPoints[endIdx-1][1] == endPoint.data[1]) {
            console.log("end zero");
            return;
        }
        chart.points = [];
        for(var i = serStart;i <= serEnd;i++) {
          var point = chart.rawPoints[i];
          chart.points.push(point);
        }
        self.render();
        //set new zoom data to store
        self.zoom.series[zIdx] = [];
         for(var i = serStart;i <= serEnd;i++) {
          var origin = chart.rawPoints[i];
          for(var s= 0;s < chart.chartPoints.length;s++) {
            var point = chart.chartPoints[s];
            if(origin[0] == point.data[0] && origin[1] == point.data[1]) {
              self.zoom.series[zIdx].push(point);
              break;
            }
          }
        }
        self.painUpdate();
      }

    } else {
       console.log(self.zoom.series.length, "equl zero");
    }
    if(!self.zoom.moveIn)
      clearInterval(self.moveTimeId);
  }



	EasyCanvas.prototype.showToolTip = function(group) {
		var rect = self.canvas.getBoundingClientRect();
    var html = "";
    for(idx in group){
      var chart = group[idx];
      for(var i = 0;i < chart.length;i++){
        var item = chart[i];
        if(html == ""){
          if(typeof(item.chart.xValueType) == "undefined")
            html = '<b style="color:#000;">'+item.point.data[0]+"</b>";
          else if(item.chart.xValueType == "datetime")
            html = '<b style="color:#000;">'+self.timeConverter(item.point.data[0])+"</b>";
        }
        var decimal = 0;
        if(typeof(item.chart.valueDecimals) != "undefined")
          decimal = parseInt(item.chart.valueDecimals);

        html += '<br/><b style="color:'+item.chart.color+';">'+item.chart.name+'</b><b style="color:#000;">:'+item.point.data[1].toFixed(decimal)+'</b>';
      }

    }
		var msgbox = '<table><tr><td>'+html+'</td></tr></table>';

		self.tooltip.innerHTML = msgbox;
		tipX = rect.left + self.mousePos.x - self.tooltip.width/2;
		tipY = rect.top + self.mousePos.y - self.tooltip.height + self.tooltip.height/4;
		var stageWidth = rect.left + self.chart.width;
		tipX = (tipX <= 0)?0:tipX;
		tipX = (tipX + self.tooltip.width/2 >= stageWidth)?stageWidth- self.tooltip.width/2:tipX;
		tipY = (tipY <= 0)?rect.top + self.mousePos.y + 30:tipY;
		self.tooltip.style.top = tipY +"px";
		self.tooltip.style.left = tipX + "px";
		self.tooltip.style.display = "block";
		self.canvas.style.cursor = "pointer";

	};

	EasyCanvas.prototype.leaveStage = function(evt) {
		self.tooltip.style.display = "none";
		self.dragStageCancel(evt);
	};

	EasyCanvas.prototype.dragStageStart = function(evt) {
    self.getMousePos(evt);
    if(self.zoom.enabled) {
			self.zoom.start.x = self.mousePos.x;
			self.zoom.start.y = self.mousePos.y;
			self.zoom.end.x = self.mousePos.x;
			self.zoom.end.y = self.mousePos.y;
			self.zoom.status = true;
			self.dragZoom();
		}

    if(self.draw.enabled) {
      self.painerStart();
    }
	};

	EasyCanvas.prototype.dataUpdate = function() {
    self.drawBackground();
    for(var i = 0; i < self.chart.series.length;i++) {
      chart = self.chart.series[i];
      switch(chart.type){
          case "bar":
            self.barUpdate(chart);
          break;
          case "line":
            self.lineUpdate(chart);
          break;
          case "baseline":
            self.baseLineUpdate(chart);
          break;
          case "baselinebar":
            self.baselineBarUpdate(chart);
          break;
      }
    }
    self.painUpdate();

	};

	EasyCanvas.prototype.switchZoomMove = function() {
		self.zoom.end.x = self.mousePos.x;
		self.zoom.end.y = self.mousePos.y;
    if(self.zoom.enabled  && self.zoom.status) {
        switch(self.zoom.zoomType){
          case "zoom":
          	self.canvas.style.cursor = "auto";
            self.dataUpdate();
            self.dragZoom();
          break;
          case "move":
          	self.canvas.style.cursor = "move";
           self.dragScanSeries(false);
          break;
        }
     }
	};

	EasyCanvas.prototype.dragStageEnd = function(evt) {
		if(self.zoom.enabled) {
			self.zoom.status = false;
			if(self.zoom.zoomType == "zoom" && self.zoom.start.x != self.zoom.end.x || self.zoom.start.y != self.zoom.end.y ){
				self.dragScanSeries(true);
			}
      self.zoom.moveIn = false;
			self.dataUpdate();
		}

    if(self.draw.enabled && self.draw.status) {
      self.draw.status = false;
      self.painerEnd();
    }
	};

	EasyCanvas.prototype.dragStageCancel = function(evt) {
		if(self.zoom.enabled) {
			self.zoom.status = false;
      self.zoom.moveIn = false;
      if(self.zoom.moveTimeId != null)
        clearInterval(self.zoom.moveTimeId);
			self.dataUpdate();
		}

    if(self.draw.enabled && self.draw.status) {
      self.draw.status = false;
      self.painerCancel();
    }
	};
	EasyCanvas.prototype.getMousePos = function(evt) {
  	var rect = self.stage.getBoundingClientRect();
     		self.mousePos = {
    		x: evt.clientX - rect.left,
    		y: evt.clientY - rect.top
  	};
   	if(self.zoom.enabled && self.zoom.status) {
			self.switchZoomMove();
		} else if(self.draw.enabled && self.draw.status) {
      self.painerMove();
    } else {
			self.scanSeries();
		}
  };

  EasyCanvas.prototype.scanSeries = function() {
  		if(self.chart.series.length > 0){
  			self.canvas.style.cursor = "auto";
        var find = false;
        //clean selected flag
        var findTipList = [];
  			for(idx in self.chart.series){
  				var chart = self.chart.series[idx];
          for(var i = 0;i < chart.chartPoints.length;i++){
            chart.chartPoints[i].selected = false;
          }
          switch(chart.type){
            case "bar":
              for(idx in chart.chartPoints){
                point = chart.chartPoints[idx];
                if(self.barInRange(point.x,self.mousePos.x,point.y,self.mousePos.y,chart.xAxis.options.width,point.height)){
                  findTipList.push({chart:chart,point:point});
                  //self.showToolTip("point["+point.data[0]+"]:"+point.data[1]);
                  chart.chartPoints[idx].selected = true;
                  find = true;
                  //break;
                }
              }
            break;
            case "line":
              for(idx in chart.chartPoints){
                point = chart.chartPoints[idx];
                if(self.lineInRange(point.x,self.mousePos.x,point.y,self.mousePos.y,this.Line.markWidth)){
                  findTipList.push({chart:chart,point:point});
                  //self.showToolTip("point["+point.data[0]+"]:"+point.data[1]);
                  chart.chartPoints[idx].selected = true;
                  find = true;
                  //break;
                }
              }
            break;
            case "baseline":
              for(idx in chart.chartPoints){
                point = chart.chartPoints[idx];
                if(self.baselineInRange(point.x,self.mousePos.x,point.y,self.mousePos.y,this.Line.markWidth)){
                  findTipList.push({chart:chart,point:point});
                  //self.showToolTip("point["+point.data[0]+"]:"+point.data[1]);
                  chart.chartPoints[idx].selected = true;
                  find = true;
                  //break;
                }
              }
            break;
            case "baselinebar":
              for(idx in chart.chartPoints){
                point = chart.chartPoints[idx];
                if(self.baselineBarInRange(point.x,self.mousePos.x,point.y,self.mousePos.y,chart.xAxis.options.width,point.height)){
                  findTipList.push({chart:chart,point:point});
                  //self.showToolTip("point["+point.data[0]+"]:"+point.data[1]);
                  chart.chartPoints[idx].selected = true;
                  find = true;
                  //break;
                }
              }
            break;
          }
        }

        if(!find){
          self.tooltip.style.display = "none";
        } else {
          var group = [];
          for(idx in findTipList) {
            item = findTipList[idx];
            if(group.length == 0)
              group[item.chart.group.id] = [];

            for(idx in self.chart.series){
      				var chart = self.chart.series[idx];
              if(chart.group.id == item.chart.group.id){
                for(pIdx in chart.chartPoints){
                  point = chart.chartPoints[pIdx];
                  if(point.x == item.point.x){
                    point.selected = true;
                    group[item.chart.group.id].push({chart:chart,point:point});
                  }
                }
              }
            }
          }
          self.showToolTip(group);
        }

  		}
  		self.dataUpdate();
	};
	EasyCanvas.prototype.barInRange = function(x,x2,y,y2,rangeX,rangeY) {
   		if((x2 - x) <= rangeX && x2 - x >= 0){
  	  		if((y2 - y) <= rangeY && y2 - y >= 0){
  				return true;
  			}
  		}
  		return false;
  };

  EasyCanvas.prototype.baselineBarInRange = function(x,x2,y,y2,rangeX,rangeY) {
   		if((x2 - x) <= rangeX && x2 - x >= 0){
  	  		if((y2 - y) <= rangeY && y2 - y >= 0){
  				return true;
  			}
  		}
  		return false;
  };

  EasyCanvas.prototype.lineInRange = function(x,x2,y,y2,range) {
   		if(Math.abs(x2 - x) <= range && Math.abs(y2 - y) <= range){
  	  		return true;
  		}
  		return false;
  };

  EasyCanvas.prototype.baselineInRange = function(x,x2,y,y2,range) {
   		if(Math.abs(x2 - x) <= range && Math.abs(y2 - y) <= range){
  	  		return true;
  		}
  		return false;
  };

  EasyCanvas.prototype.timeConverter = function(UNIX_timestamp){
     var a = new Date(UNIX_timestamp);
     var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
         var year = a.getFullYear();
         var month = months[a.getMonth()];
         var date = a.getDate();
         var hour = a.getHours();
         hour = (hour < 10)?"0"+hour:hour;
         var min = a.getMinutes();
         min = (min < 10)?"0"+min:min;
         var sec = a.getSeconds();
         sec = (sec < 10)?"0"+sec:sec;
         var time = date+','+month+' '+year+' '+hour+':'+min+':'+sec ;
         return time;
  };

  EasyCanvas.prototype.dateFormat = function(UNIX_timestamp,type){
     var a = new Date(UNIX_timestamp);
     var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
     var year = a.getFullYear();
     var month = months[a.getMonth()];
     var date = a.getDate();
     var hour = a.getHours();
     hour = (hour < 10)?"0"+hour:hour;
     var min = a.getMinutes();
     min = (min < 10)?"0"+min:min;
     var sec = a.getSeconds();
     sec = (sec < 10)?"0"+sec:sec;
     var time = "";
     var timeFormat = type.split("%");
     for(idx in timeFormat){
       var format = timeFormat[idx];
       switch(format.substr(0,1)){
         case "s":
          time += (format.length == 1)?sec:sec + format.substr(1);
         break;
         case "i":
          time += (format.length == 1)?min:min + format.substr(1);
         break;
         case "h":
          time += (format.length == 1)?hour:hour + format.substr(1);
         break;
         case "d":
          time += (format.length == 1)?date:date + format.substr(1);
         break;
         case "m":
          time += (format.length == 1)?month:month + format.substr(1);
         break;
         case "y":
          time += (format.length == 1)?year:year + format.substr(1);
         break;
       }
     }
     return time;
  }
	self.create();
	self.render();
}
