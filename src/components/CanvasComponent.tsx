import 'bootstrap/dist/css/bootstrap.min.css';
import React, { useRef, useEffect, useState } from 'react';
import { ButtonType, GamepadStick, IPlay, KeyboardStick, StickData, saveData } from '../services/PlayData';
import { TitlePlay } from '../services/TitlePlay';
import { Button, Col, Container, Modal, Row, Table } from 'react-bootstrap';
import { ArrowLeft, ArrowRight, ArrowUp, ArrowDown, CardList, CaretRight, BoxArrowInDownLeft, BoxArrowInDownRight, ArrowReturnLeft, ArrowReturnRight, ArrowRepeat, BoxArrowInDown, PlayFill, ArrowClockwise, ArrowCounterclockwise } from 'react-bootstrap-icons';

interface CanvasComponentProps {
    // ここに必要なプロパティを追加
}


const keyConfigIndex = [
    ButtonType.HardDrop,
    ButtonType.Left,
    ButtonType.Drop,
    ButtonType.Right,
    ButtonType.Start,
    ButtonType.Hold,
    ButtonType.LeftTurn,
    ButtonType.RightTurn
];

const keyConfigLabels = [
    'ArrowUp',
    'ArrowLeft',
    'ArrowDown',
    'ArrowRight',
    'Enter',
    'Space',
    'KeyZ',
    'KeyX'
];

let configSetMap: { [key: string]: number; } = {};
let padSetMap: { [button: number]: number } = {};

const CanvasComponent: React.FC<CanvasComponentProps> = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animationFrameIdRef = useRef<number>();
    const contextRef = useRef<WebGL2RenderingContext>();
    const playRef = useRef<IPlay>();
    const stickRef = useRef<KeyboardStick>(new KeyboardStick());

    const [keyConfig] = useState<string[]>(keyConfigLabels);
    const [isOpen, setIsOpen] = useState(false);
    const [keySelect, setKeySelect] = useState(-1);
    const [keyLabels, setKeyLabels] = useState<string[]>([]);
    const [padEnabled, setPadEnabled] = useState<boolean>(false);
    const [padConfig, setPadConfig] = useState<boolean>(false);

    const makeKeyLabels = () => {
        const config = stickRef.current.getKeyConfig();
        for (let key in config) {
            const type = config[key];
            keyConfigLabels[keyConfigIndex.indexOf(type)] = key;
        }
    };
    const makePadLabels = () => {
        const config = (stickRef.current as GamepadStick).getPadConfig();
        for (let type of keyConfigIndex) {
            keyConfigLabels[keyConfigIndex.indexOf(type)] = "Button " + config.buttons[type];
        }
    };

    const pushPadHandler = (button: number) => {
        if (keySelectRef.current < 0 || button in padSetMap) {
            // すでに設定済み
            return;
        }
        (stickRef.current as GamepadStick).resetPad();
        padSetMap[button] = keyConfigIndex[keySelectRef.current];
        keyConfigLabels[keySelectRef.current] = "Button " + button;
        if (keySelectRef.current + 1 < keyConfigLabels.length) {
            setKeySelect(keySelectRef.current + 1);
        } else {
            setKeySelect(-1);
        }
    }
    const openDialog = (pad: boolean, button?: HTMLButtonElement) => {
        setPadConfig(pad);
        if (pad) {
            makePadLabels();
            (stickRef.current as GamepadStick).pushListener = pushPadHandler;
        } else {
            makeKeyLabels();
        }
        setIsOpen(true);
        setKeySelect(0);
        configSetMap = {};
        padSetMap = {};
        if (button) {
            button.blur();
        }
    };
    const closeDialog = () => {
        if (padConfig && stickRef.current instanceof GamepadStick) {
            (stickRef.current as GamepadStick).pushListener = undefined;
        }
        setIsOpen(false);
    };
    const applyDialog = () => {
        if (padConfig) {
            const pad = stickRef.current as GamepadStick;
            let newConfig = pad.getPadConfig();
            for (let key in padSetMap) {
                newConfig.buttons[padSetMap[key]] = parseInt(key);
            }
            pad.setPadConfig(newConfig);
        } else {
            let config: { [key: string]: ButtonType; } = {};
            for (let key in configSetMap) {
                config[key] = keyConfigIndex[configSetMap[key]];
            }
            stickRef.current.setKeyConfig(config);
            setKeyLabels([...keyConfigLabels]);
        }
        setIsOpen(false);
    };
    const onGamepadConnected = (e: GamepadEvent) => {
        console.log(e);
        stickRef.current = new GamepadStick(e.gamepad);
        setPadEnabled(true);
    };
    const onGamepadDisconnected = (e: GamepadEvent) => {
        console.log(e);
        stickRef.current = new KeyboardStick();
        setPadEnabled(false);
    };

    const isOpenRef = useRef(isOpen);
    const keySelectRef = useRef(keySelect);
    const padConfigRef = useRef(padConfig);

    useEffect(() => {
        isOpenRef.current = isOpen;
    }, [isOpen]);
    useEffect(() => {
        keySelectRef.current = keySelect;
    }, [keySelect]);
    useEffect(() => {
        padConfigRef.current = padConfig;
    }, [padConfig]);

    const onKeyEvent = (event: KeyboardEvent) => {
        if (isOpenRef.current) {
            if (event.type === 'keydown' && !padConfigRef.current) {
                if (keySelectRef.current < 0 || event.code in configSetMap) {
                    // すでに設定済み
                    return;
                }
                event.preventDefault();
                configSetMap[event.code] = keySelectRef.current;
                keyConfigLabels[keySelectRef.current] = event.code;
                if (keySelectRef.current + 1 < keyConfigLabels.length) {
                    setKeySelect(keySelectRef.current + 1);
                } else {
                    setKeySelect(-1);
                }
            }
        } else {
            if (stickRef.current.processEvent(event as any)) {
                event.preventDefault();
            }
        }
    }

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        contextRef.current = canvas.getContext('webgl2')!;
        playRef.current = new TitlePlay(contextRef.current);
        saveData.getConfig('keyConfig').then(res => {
            makeKeyLabels();
            setKeyLabels([...keyConfigLabels]);
        });

        console.log("Init");
        const proc = () => {
            stickRef.current.checkButton();
            playRef.current = playRef.current!.stepFrame(contextRef.current!, stickRef.current!);
            animationFrameIdRef.current = requestAnimationFrame(proc);
        };
        animationFrameIdRef.current = requestAnimationFrame(proc);

        window.addEventListener("keydown", onKeyEvent, false);
        window.addEventListener("keyup", onKeyEvent, false);
        window.addEventListener("gamepadconnected", onGamepadConnected);
        window.addEventListener("gamepaddisconnected", onGamepadDisconnected);
        return () => {
            cancelAnimationFrame(animationFrameIdRef.current!);
            console.log("Clear");
            window.removeEventListener("keydown", onKeyEvent);
            window.removeEventListener("keyup", onKeyEvent);
            window.removeEventListener("gamepadconnected", onGamepadConnected);
            window.removeEventListener("gamepaddisconnected", onGamepadDisconnected);
        }
    }, []);

    return (
        <div style={{ display: "flex", padding: "1em" }}>
            <canvas ref={canvasRef} width={512} height={512} style={{ backgroundColor: "black" }} />
            <div>
                <Table striped bordered style={{ marginLeft: '1em' }}>
                    <thead>
                        <tr><th colSpan={2}>キー</th><th>操作内容</th></tr>
                    </thead>
                    <tbody>
                        <tr><td><BoxArrowInDown></BoxArrowInDown></td><td>{keyLabels[0]}</td><td>ハードドロップ</td></tr>
                        <tr><td><ArrowLeft></ArrowLeft></td><td>{keyLabels[1]}</td><td>左移動</td></tr>
                        <tr><td><ArrowDown></ArrowDown></td><td>{keyLabels[2]}</td><td>ソフトドロップ</td></tr>
                        <tr><td><ArrowRight></ArrowRight></td><td>{keyLabels[3]}</td><td>右移動</td></tr>
                        <tr><td><CaretRight></CaretRight></td><td>{keyLabels[4]}</td><td>ゲーム開始</td></tr>
                        <tr><td><ArrowRepeat></ArrowRepeat></td><td>{keyLabels[5]}</td><td>ホールド</td></tr>
                        <tr><td><ArrowCounterclockwise></ArrowCounterclockwise></td><td>{keyLabels[6]}</td><td>左回転</td></tr>
                        <tr><td><ArrowClockwise></ArrowClockwise></td><td>{keyLabels[7]}</td><td>右回転</td></tr>
                    </tbody>
                </Table>
                <Button onClick={(event) => openDialog(false, event.target as HTMLButtonElement)}>キー設定</Button>
                {
                    padEnabled && <Button onClick={(event) => openDialog(true, event.target as HTMLButtonElement)} style={{ marginLeft: "1em" }}>パッド設定</Button>
                }
                <Modal show={isOpen} onHide={closeDialog}>
                    <Modal.Header>
                        <Modal.Title>{padConfig ? "パッド設定" : "キー設定"}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Container>
                            <Row>
                                <Col xs={2}></Col>
                                <Col xs={3} className='text-center'>
                                    <BoxArrowInDown size={50} className={keySelect === 0 ? 'bg-info' : ''}></BoxArrowInDown>
                                    <p style={{ fontSize: '10px' }}>{keyConfig[0]}</p>
                                </Col>
                                <Col xs={1}></Col>
                                <Col xs={3} className='text-center'>
                                    <CaretRight size={50} className={keySelect === 4 ? 'bg-info' : ''}></CaretRight>
                                    <p style={{ fontSize: '10px' }}>{keyConfig[4]}</p>
                                </Col>
                                <Col xs={3} className='text-center'>
                                    <ArrowRepeat size={50} className={keySelect === 5 ? 'bg-info' : ''}></ArrowRepeat>
                                    <p style={{ fontSize: '10px' }}>{keyConfig[5]}</p>
                                </Col>
                            </Row>
                            <Row>
                                <Col xs={3} className='text-center'>
                                    <ArrowLeft size={50} className={keySelect === 1 ? 'bg-info' : ''}></ArrowLeft>
                                    <p style={{ fontSize: '10px' }}>{keyConfig[1]}</p>
                                </Col>
                                <Col xs={1}></Col>
                                <Col xs={3} sm={3} md={3} lg={3} className='text-center'>
                                    <ArrowRight size={50} className={keySelect === 3 ? 'bg-info' : ''}></ArrowRight>
                                    <p style={{ fontSize: '10px' }}>{keyConfig[3]}</p>
                                </Col>
                            </Row>
                            <Row>
                                <Col xs={2}></Col>
                                <Col xs={3} className='text-center'>
                                    <ArrowDown size={50} className={keySelect === 2 ? 'bg-info' : ''}></ArrowDown>
                                    <p style={{ fontSize: '10px' }}>{keyConfig[2]}</p>
                                </Col>
                                <Col xs={1}></Col>
                                <Col xs={3} className='text-center'>
                                    <ArrowCounterclockwise size={50} className={keySelect === 6 ? 'bg-info' : ''}></ArrowCounterclockwise>
                                    <p style={{ fontSize: '10px' }}>{keyConfig[6]}</p>
                                </Col>
                                <Col xs={3} className='text-center'>
                                    <ArrowClockwise size={50} className={keySelect === 7 ? 'bg-info' : ''}></ArrowClockwise>
                                    <p style={{ fontSize: '10px' }}>{keyConfig[7]}</p>
                                </Col>
                            </Row>
                        </Container>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button disabled={keySelect >= 0} variant='success' onClick={applyDialog}>決定</Button>
                        <Button disabled={keySelect === 0} variant='warning' onClick={() => openDialog(padConfig)}>再設定</Button>
                        <Button variant='danger' onClick={closeDialog}>キャンセル</Button>
                    </Modal.Footer>
                </Modal>
            </div>

        </div >
    );
};

export default CanvasComponent;