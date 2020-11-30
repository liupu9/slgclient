import { ArmyCmd, ArmyData } from "../../general/ArmyProxy";
import GeneralCommand from "../../general/GeneralCommand";
import ArmyCommand from "../../general/ArmyCommand";
import { GeneralCommonConfig, GeneralConfig, GeneralData } from "../../general/GeneralProxy";

const { ccclass, property } = cc._decorator;

@ccclass
export default class ArmySelectItemLogic extends cc.Component {
    @property(cc.Node)
    tipNode: cc.Node = null;
    @property(cc.Label)
    labelTip: cc.Label = null;
    @property(cc.Sprite)
    headIcon: cc.Sprite = null;
    @property(cc.Label)
    labelLv: cc.Label = null;
    @property(cc.Label)
    labelName: cc.Label = null;
    @property(cc.Label)
    labelState: cc.Label = null;
    @property(cc.Label)
    labelMorale: cc.Label = null;
    @property(cc.Label)
    labelSoldierCnt: cc.Label = null;
    @property(cc.Label)
    labelVice1: cc.Label = null;
    @property(cc.Label)
    labelVice2: cc.Label = null;
    @property(cc.ProgressBar)
    progressSoldier: cc.ProgressBar = null;

    protected _data: ArmyData = null;
    protected _cmd: number = 0;
    protected _toX: number = 0;
    protected _toY: number = 0;

    protected onLoad(): void {
        cc.systemEvent.on("update_army", this.onUpdateArmy, this);
        this.tipNode.active = false;
    }

    protected onDestroy(): void {
        cc.systemEvent.targetOff(this);
        this._data = null;
    }

    protected onUpdateArmy(armyData: ArmyData): void {
        if (armyData.id == this._data.id) {
            this.setArmyData(armyData, this._cmd, this._toX, this._toY);
        }
    }

    protected onClickItem(): void {
        if (this.tipNode.active == false) {
            ArmyCommand.getInstance().generalAssignArmy(this._data.id, this._cmd, this._toX, this._toY);
            cc.systemEvent.emit("close_army_select_ui");
        } else {
            console.log("军队忙");
        }
    }

    protected updateItem(): void {
        if (this._data && this._data.generals[0] != 0) {
            console.log("updateItem", this._data);
            let commonCfg: GeneralCommonConfig = GeneralCommand.getInstance().proxy.getCommonCfg();
            let generals: GeneralData[] = ArmyCommand.getInstance().getArmyGenerals(this._data);
            let firstGeneralCfg: GeneralConfig = GeneralCommand.getInstance().proxy.getGeneralCfg(generals[0].cfgId);
            let power: number = ArmyCommand.getInstance().getArmyPhysicalPowerByGenerals(generals);
            let curSoldierCnt: number = ArmyCommand.getInstance().getArmyCurSoldierCnt(this._data);
            let totalSoldierCnt: number = ArmyCommand.getInstance().getArmyTotalSoldierCntByGenerals(generals);

            if (power < commonCfg.recovery_physical_power) {
                //体力不足
                this.tipNode.active = true;
                this.labelTip.string = "体力不足";
            } else if (this._data.soldiers[0] <= 0) {
                //兵力不足
                this.tipNode.active = true;
                this.labelTip.string = "主将兵力不足";
            } else if (this._data.state > 0) {
                //行军中
                this.tipNode.active = true;
                this.labelTip.string = "行军中...";
            } else if (this._data.cmd == ArmyCmd.Reclaim) {
                //屯田中
                this.tipNode.active = true;
                this.labelTip.string = "屯田中...";
            } else {
                this.tipNode.active = false;
            }

            this.headIcon.spriteFrame = GeneralCommand.getInstance().proxy.getGeneralTex(generals[0].cfgId);
            this.labelLv.string = generals[0].level + "";
            this.labelName.string = firstGeneralCfg.name;
            this.labelState.string = ArmyCommand.getInstance().getArmyStateDes(this._data);
            this.labelSoldierCnt.string = curSoldierCnt + "/" + totalSoldierCnt;
            this.progressSoldier.progress = curSoldierCnt / totalSoldierCnt;

            if (generals[1]) {
                let sencondGeneralCfg: GeneralConfig = GeneralCommand.getInstance().proxy.getGeneralCfg(generals[1].cfgId);
                this.labelVice1.string = sencondGeneralCfg.name;
            } else {
                this.labelVice1.string = "";
            }

            if (generals[2]) {
                let thirdGeneralCfg: GeneralConfig = GeneralCommand.getInstance().proxy.getGeneralCfg(generals[2].cfgId);
                this.labelVice2.string = thirdGeneralCfg.name;
            } else {
                this.labelVice2.string = "";
            }
        }
    }

    public setArmyData(data: ArmyData, cmd: number, x: number, y: number): void {
        this._data = data;
        this._cmd = cmd;
        this._toX = x;
        this._toY = y;
        console.log("setArmyData", arguments);
        this.updateItem();
    }
}