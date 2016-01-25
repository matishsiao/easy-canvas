var EasyCanvas = function(container,param) { 
 	var self = this;
 	self.name = container;
	self.stage = null;
  self.canvas = null;
	self.chart = param.chart;
	self.mousePos = {x:0,y:0};
	self.margin = 5;
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
	self.chart.series = param.series;
	self.chart.color = (typeof(self.chart.color) == "undefined")?"#FFF":self.chart.color;
	self.Grid = {
  		color:"#00000F",
  		selectColor:"#00FF0F",
  		fontSize:10,
  		width:4,
  		margin:20,
  		maxFontSize:15,
  		border:1,
  		borderColor:"#000"
	};
	self.Line = {
		width:1,
		markWidth:3,
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
  	for(idx in chart.xAxis.series) {
  			var grid = chart.xAxis.series[idx];
  			self.ctx.fillText(grid.text,grid.x,grid.y,self.Grid.maxFontSize);
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
  	gridPct = Math.ceil((chart.chartPoints.length) / 8);
  	for(var i = 0;i < 9;i++) {
  		idx = gridPct * i;
  		if(idx >= chart.chartPoints.length)
  			continue;
  		var value = chart.chartPoints[idx].data[0];
  		var grid = {
  		  x:(idx * (chart.xAxis.options.width  + self.margin)) + self.Grid.margin,
  			y:chart.top + chart.height - self.Grid.fontSize/2,
  			text:value,
  			range:gridPct
  		};
  		chart.xAxis.series.push(grid);
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
  	gridPct = Math.ceil((chart.chartPoints.length) / 8);
  	for(var i = 0;i < 9;i++) {
  		idx = gridPct * i;
  		if(idx >= chart.chartPoints.length)
  			continue;
  		var value = chart.chartPoints[idx].data[0];
  		var grid = {
  			x:(idx * (chart.xAxis.options.width  + self.margin)) + self.Grid.margin,
  			y:chart.top + chart.height - self.Grid.fontSize/2,
  			text:value,
  			range:gridPct
  		};
  		chart.xAxis.series.push(grid);
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
	
	EasyCanvas.prototype.drawLinePath = function(color,selectColor,lineColor,data) {
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
			self.ctx.fillStyle = (point.selected)?selectColor:color;
			self.ctx.beginPath();
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
	
	EasyCanvas.prototype.draw = function() {
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
  		self.drawBaseLinePath(self.BaseLine.plusColor,self.BaseLine.lessColor,self.BaseLine.selectColor,self.BaseLine.color,chart.chartPoints);
  	}
  	EasyCanvas.prototype.baseLineUpdate = function(chart) {
  		
  		self.drawGridBackground(chart);
  		self.drawBaseLinePath(self.BaseLine.plusColor,self.BaseLine.lessColor,self.BaseLine.selectColor,self.BaseLine.color,chart.chartPoints);
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
  		self.drawLinePath(self.Line.color,self.Line.selectColor,self.Line.color,chart.chartPoints);
  	}
  	EasyCanvas.prototype.lineUpdate = function(chart) {
  		self.drawGridBackground(chart);
  		self.drawLinePath(self.Line.color,self.Line.selectColor,self.Line.color,chart.chartPoints);
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
  		xAxis.width = (self.chart.width - self.Grid.margin * 2 - (self.margin * (chart.points.length + 1))) / chart.points.length;
  		yAxis.max = Math.max.apply(null, yAxis.data)*1.05;
  		yAxis.min = Math.min.apply(null, yAxis.data);
  		yAxis.min = (yAxis.min < 0)?yAxis.min * 1.05:yAxis.min-yAxis.min*0.05;
  		yAxis.range = Math.abs(yAxis.max - yAxis.min);
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
  			self.drawRect(self.Bar.color,true,point.x,point.y,point.height,chart.xAxis.options.width);
  		}
  	};
  
	EasyCanvas.prototype.barUpdate = function(chart) {
  		self.drawGridBackground(chart);
  		for(var i = 0;i < chart.chartPoints.length;i++) {
  			var point = chart.chartPoints[i];
  			self.drawRect((!point.selected)?self.Bar.color:self.Bar.selectColor,true,point.x,point.y,point.height,chart.xAxis.options.width);
  		}
 	};
 	
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
  	self.draw();
	};

  EasyCanvas.prototype.ZoomIn = function() {
    self.zoom.zoomType = "zoom";
    self.draw();
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
    self.draw();
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
  		self.draw();
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
        self.draw();
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
      }
        
    } else {
       console.log(self.zoom.series.length, "equl zero");
    }
    if(!self.zoom.moveIn)
      clearInterval(self.moveTimeId);
  }
  
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
      
      if(typeof(self.chart.series[i].width) == "undefined") {
        self.chart.series[i].width = self.chart.width;
      } 

      if(typeof(self.chart.series[i].top) == "undefined") {
        self.chart.series[i].top = 0;
      } else {
        if(self.chart.series[i].top + self.chart.series[i].height >= self.chart.height)
          self.chart.series[i].height = self.chart.height - self.chart.series[i].top;
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
	
	EasyCanvas.prototype.showToolTip = function(msg) {
		var rect = self.canvas.getBoundingClientRect();
		var msgbox = '<table><tr><td>'+msg+'</td></tr></table>';
		
		self.tooltip.innerHTML = msgbox;
		tipX = rect.left + self.mousePos.x - self.tooltip.width/2;
		tipY = rect.top + self.mousePos.y - 30;
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
		if(self.zoom.enabled) {
			self.getMousePos(evt);
			self.zoom.start.x = self.mousePos.x;
			self.zoom.start.y = self.mousePos.y;
			self.zoom.end.x = self.mousePos.x;
			self.zoom.end.y = self.mousePos.y;
			self.zoom.status = true;
			self.dragZoom();
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
		
	};
	
	EasyCanvas.prototype.dragStageMove = function() {
		self.zoom.end.x = self.mousePos.x;
		self.zoom.end.y = self.mousePos.y;
		//self.dataUpdate();
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
		//self.dragZoom();
   
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
	};
	
	EasyCanvas.prototype.dragStageCancel = function(evt) {
		if(self.zoom.enabled) {
			self.zoom.status = false;
      self.zoom.moveIn = false;
      if(self.zoom.moveTimeId != null)
        clearInterval(self.zoom.moveTimeId);
			self.dataUpdate();
		}
	};
	EasyCanvas.prototype.getMousePos = function(evt) {
  	var rect = self.stage.getBoundingClientRect();
     		self.mousePos = {
    		x: evt.clientX - rect.left,
    		y: evt.clientY - rect.top
  	};
   	if(self.zoom.enabled && self.zoom.status) {
			self.dragStageMove();
		} else {
			self.scanSeries();
		}
  }; 
  
  	EasyCanvas.prototype.scanSeries = function() {
  		if(self.chart.series.length > 0){
  			self.canvas.style.cursor = "auto";
        var find = false;
        //clean selected flag
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
                  self.showToolTip("point["+point.data[0]+"]:"+point.data[1]);
                  chart.chartPoints[idx].selected = true;
                  find = true;
                  break;
                }
              }
            break;
            case "line":
              for(idx in chart.chartPoints){
                point = chart.chartPoints[idx];
                if(self.lineInRange(point.x,self.mousePos.x,point.y,self.mousePos.y,this.Line.markWidth)){
                  self.showToolTip("point["+point.data[0]+"]:"+point.data[1]);
                  chart.chartPoints[idx].selected = true;
                  find = true;
                  break;
                }
              }
            break;
            case "baseline":
              for(idx in chart.chartPoints){
                point = chart.chartPoints[idx];
                if(self.baselineInRange(point.x,self.mousePos.x,point.y,self.mousePos.y,this.Line.markWidth)){
                  self.showToolTip("point["+point.data[0]+"]:"+point.data[1]);
                  chart.chartPoints[idx].selected = true;
                  find = true;
                  break;
                }
              }
            break;
            case "baselinebar":
              for(idx in chart.chartPoints){
                point = chart.chartPoints[idx];
                if(self.baselineBarInRange(point.x,self.mousePos.x,point.y,self.mousePos.y,chart.xAxis.options.width,point.height)){
                  self.showToolTip("point["+point.data[0]+"]:"+point.data[1]);
                  chart.chartPoints[idx].selected = true;
                  find = true;
                  break;
                }
              }
            break;
          }
        }	
  			
        if(!find){
          self.tooltip.style.display = "none";
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
	self.create();
	self.draw();
}
