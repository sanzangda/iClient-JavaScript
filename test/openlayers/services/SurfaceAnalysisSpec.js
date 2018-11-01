import ol from 'openlayers';
import {SpatialAnalystService} from '../../../src/openlayers/services/SpatialAnalystService';
import {DatasetSurfaceAnalystParameters} from '../../../src/common/iServer/DatasetSurfaceAnalystParameters';
import {SurfaceAnalystParametersSetting} from '../../../src/common/iServer/SurfaceAnalystParametersSetting';
import {SmoothMethod} from '../../../src/common/REST';
import {FetchRequest} from "@supermap/iclient-common";

var originalTimeout, serviceResults;
var sampleServiceUrl = GlobeParameter.spatialAnalystURL;
describe('openlayers_SpatialAnalystService_surfaceAnalysis', () => {
    beforeEach(() => {
        originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;
        jasmine.DEFAULT_TIMEOUT_INTERVAL = 50000;
        serviceResults = null;
    });
    afterEach(() => {
        jasmine.DEFAULT_TIMEOUT_INTERVAL = originalTimeout;
    });

    //表面分析(提取等值线)
    it('surfaceAnalysis', (done) => {
        var region = new ol.geom.Polygon([[
            [0, 4010338],
            [1063524, 4010338],
            [1063524, 3150322],
            [0, 3150322]
        ]]);
        var surfaceAnalystParameters = new DatasetSurfaceAnalystParameters({
            extractParameter: new SurfaceAnalystParametersSetting({
                datumValue: 0,
                interval: 2,
                resampleTolerance: 0,
                smoothMethod: SmoothMethod.BSPLINE,
                smoothness: 3,
                clipRegion: region
            }),
            dataset: "SamplesP@Interpolation",
            resolution: 3000,
            zValueFieldName: "AVG_TMP"
        });
        //创建表面分析服务实例
        var surfaceAnalystService = new SpatialAnalystService(sampleServiceUrl);
        spyOn(FetchRequest, 'commit').and.callFake((method, testUrl, params, options) => {
            expect(method).toBe("POST");
            expect(testUrl).toBe(sampleServiceUrl + "/datasets/SamplesP@Interpolation/isoline.json?returnContent=true");
            var expectParams = `{'resolution':3000,'extractParameter':{'datumValue':0,'interval':2,'resampleTolerance':0,'smoothMethod':"BSPLINE",'smoothness':3,'clipRegion':{'id':0,'style':null,'parts':[5],'points':[{'id':"SuperMap.Geometry_11",'bounds':null,'SRID':null,'x':0,'y':4010338,'tag':null,'type':"Point"},{'id':"SuperMap.Geometry_12",'bounds':null,'SRID':null,'x':1063524,'y':4010338,'tag':null,'type':"Point"},{'id':"SuperMap.Geometry_13",'bounds':null,'SRID':null,'x':1063524,'y':3150322,'tag':null,'type':"Point"},{'id':"SuperMap.Geometry_14",'bounds':null,'SRID':null,'x':0,'y':3150322,'tag':null,'type':"Point"},{'id':"SuperMap.Geometry_15",'bounds':null,'SRID':null,'x':0,'y':4010338,'tag':null,'type':"Point"}],'type':"REGION",'prjCoordSys':{'epsgCode':null}}},'resultSetting':{'expectCount':1000,'dataset':null,'dataReturnMode':"RECORDSET_ONLY",'deleteExistResultDataset':true},'zValueFieldName':"AVG_TMP",'filterQueryParameter':{'attributeFilter':null,'name':null,'joinItems':null,'linkItems':null,'ids':null,'orderBy':null,'groupBy':null,'fields':null}}`;
            expect(params).toBe(expectParams);
            expect(options).not.toBeNull();
            return Promise.resolve(new Response(surfaceAnalystEscapedJson));
        });
        surfaceAnalystService.surfaceAnalysis(surfaceAnalystParameters, (surfaceAnalystServiceResult) => {
            serviceResults = surfaceAnalystServiceResult;
        });
        setTimeout(() => {
            expect(serviceResults).not.toBeNull();
            expect(serviceResults.type).toBe('processCompleted');
            expect(serviceResults.result.recordset).not.toBeNull();
            done();
        }, 8000);
    });
});