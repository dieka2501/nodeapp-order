module.exports = {
	tanggal: function(){
		datetime  	= new Date();
		var tahun 	= datetime.getFullYear();
		var tanggal = datetime.getUTCDate();
		var bulan 	= datetime.getMonth()+1;
		var jam 	= datetime.getHours();
		var menit 	= datetime.getMinutes()	;
		var detik 	= datetime.getSeconds();
		return tahun+"-"+bulan+"-"+tanggal+" "+jam+":"+menit+":"+detik;
	}
}
