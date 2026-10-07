export type SubtitleWord={word:string;start:number;end:number};
export type SubtitleSegment={id:string;start:number;end:number;text:string;words?:SubtitleWord[]};
export type SubtitleStyle={font:string;size:number;weight:number;letterSpacing:number;lineHeight:number;align:'left'|'center'|'right';color:string;highlightColor:string;background:string;backgroundOpacity:number;outline:number;shadow:number;radius:number;padding:number;position:'top'|'center'|'bottom';x:number;y:number;preset:string};
export type SubtitleAnimation={preset:string;speed:number;intensity:number};
export type Project={videoUrl:string;duration:number;subtitles:SubtitleSegment[];style:SubtitleStyle;animation:SubtitleAnimation;aspectRatio:string;currentTime:number};
